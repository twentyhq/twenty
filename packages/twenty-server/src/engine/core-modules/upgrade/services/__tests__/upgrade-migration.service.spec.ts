import { type Repository } from 'typeorm';

import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { type UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { type UpgradeMigrationEntity } from 'src/engine/core-modules/upgrade/upgrade-migration.entity';

const FAST_A = '1.21.0_AddColumn_1772000001000';
const SLOW_B = '1.21.0_Backfill_1772000002000';
const WORKSPACE_C = '1.21.0_WorkspaceThing_1772000003000';
const FAST_D = '1.22.0_AddOtherColumn_1776000001000';

const SEQUENCE = [
  { kind: 'fast-instance', name: FAST_A },
  { kind: 'slow-instance', name: SLOW_B },
  { kind: 'workspace', name: WORKSPACE_C },
  { kind: 'fast-instance', name: FAST_D },
];

type Row = {
  name: string;
  status: 'completed' | 'failed';
  executedByVersion: string;
  errorMessage: string | null;
  createdAt: Date;
};

const buildRow = (
  name: string,
  status: 'completed' | 'failed',
  createdAt: string,
): Row => ({
  name,
  status,
  executedByVersion: 'test',
  errorMessage: status === 'failed' ? 'boom' : null,
  createdAt: new Date(createdAt),
});

type QueryBuilderMock = {
  select: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  getMany: jest.Mock;
};

const buildService = (rows: Row[]): UpgradeMigrationService => {
  const queryBuilder: QueryBuilderMock = {
    select: jest.fn(() => queryBuilder),
    where: jest.fn(() => queryBuilder),
    andWhere: jest.fn(() => queryBuilder),
    getMany: jest.fn().mockResolvedValue(rows),
  };

  const repository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
  } as unknown as Repository<UpgradeMigrationEntity>;

  const sequenceReader = {
    getUpgradeSequence: () => SEQUENCE,
  } as unknown as UpgradeSequenceReaderService;

  return new UpgradeMigrationService(repository, sequenceReader);
};

describe('UpgradeMigrationService', () => {
  describe('getInstanceProgress', () => {
    // The staging outage in short: the slow command ran days after the fast
    // commands that follow it, so the newest row sat far behind the real
    // position. Progress must not depend on when anything ran.
    it('reports the furthest completed step whatever order the rows were written in', async () => {
      const service = buildService([
        buildRow(FAST_A, 'completed', '2026-07-01T00:00:00Z'),
        buildRow(FAST_D, 'completed', '2026-07-02T00:00:00Z'),
        buildRow(SLOW_B, 'completed', '2026-07-29T00:00:00Z'),
      ]);

      const progress = await service.getInstanceProgress();

      expect(progress.blocked).toBeNull();
      expect(progress.lastCompleted?.name).toBe(FAST_D);
    });

    it('blocks at the first instance step that was never attempted', async () => {
      const service = buildService([
        buildRow(FAST_A, 'completed', '2026-07-01T00:00:00Z'),
        buildRow(FAST_D, 'completed', '2026-07-02T00:00:00Z'),
      ]);

      const progress = await service.getInstanceProgress();

      expect(progress.blocked?.name).toBe(SLOW_B);
      expect(progress.blocked?.attempt).toBeNull();
      expect(progress.lastCompleted?.name).toBe(FAST_A);
    });

    it('blocks at a failed step and keeps its attempt for reporting', async () => {
      const service = buildService([
        buildRow(FAST_A, 'completed', '2026-07-01T00:00:00Z'),
        buildRow(SLOW_B, 'failed', '2026-07-02T00:00:00Z'),
        buildRow(FAST_D, 'completed', '2026-07-03T00:00:00Z'),
      ]);

      const progress = await service.getInstanceProgress();

      expect(progress.blocked?.name).toBe(SLOW_B);
      expect(progress.blocked?.attempt?.errorMessage).toBe('boom');
      expect(progress.lastCompleted?.name).toBe(FAST_A);
    });

    it('does not treat workspace steps as instance progress', async () => {
      const service = buildService([
        buildRow(FAST_A, 'completed', '2026-07-01T00:00:00Z'),
        buildRow(SLOW_B, 'completed', '2026-07-02T00:00:00Z'),
        buildRow(FAST_D, 'completed', '2026-07-03T00:00:00Z'),
      ]);

      const progress = await service.getInstanceProgress();

      expect(progress.blocked).toBeNull();
      expect(progress.lastCompleted?.name).toBe(FAST_D);
    });

    it('reports no progress at all on an empty instance', async () => {
      const service = buildService([]);

      const progress = await service.getInstanceProgress();

      expect(progress.lastCompleted).toBeNull();
      expect(progress.blocked?.name).toBe(FAST_A);
    });
  });

  describe('getInstanceCommandCursor', () => {
    it('prefers the blocking failure over the last success', async () => {
      const service = buildService([
        buildRow(FAST_A, 'completed', '2026-07-01T00:00:00Z'),
        buildRow(SLOW_B, 'failed', '2026-07-02T00:00:00Z'),
      ]);

      const cursor = await service.getInstanceCommandCursor();

      expect(cursor?.name).toBe(SLOW_B);
      expect(cursor?.status).toBe('failed');
    });

    it('returns the furthest completed step when nothing is blocking', async () => {
      const service = buildService([
        buildRow(FAST_A, 'completed', '2026-07-01T00:00:00Z'),
        buildRow(SLOW_B, 'completed', '2026-07-29T00:00:00Z'),
        buildRow(FAST_D, 'completed', '2026-07-02T00:00:00Z'),
      ]);

      const cursor = await service.getInstanceCommandCursor();

      expect(cursor?.name).toBe(FAST_D);
      expect(cursor?.status).toBe('completed');
    });

    it('throws from the OrThrow variant on an uninitialized database', async () => {
      const service = buildService([]);

      await expect(service.getInstanceCommandCursorOrThrow()).rejects.toThrow(
        'No instance command found',
      );
    });
  });
});
