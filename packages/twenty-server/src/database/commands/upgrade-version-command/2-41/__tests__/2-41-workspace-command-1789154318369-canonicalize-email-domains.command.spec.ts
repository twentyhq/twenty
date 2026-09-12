import { FieldMetadataType } from 'twenty-shared/types';
import { type DataSource, type QueryRunner } from 'typeorm';

import { type WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { CanonicalizeEmailDomainsCommand } from 'src/database/commands/upgrade-version-command/2-41/2-41-workspace-command-1789154318369-canonicalize-email-domains.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const FIELD_ID = '20202020-0000-0000-0000-000000000002';

const buildCache = (isUnique = false) => ({
  flatFieldMetadataMaps: {
    byUniversalIdentifier: {
      emailField: {
        id: FIELD_ID,
        name: 'emails',
        type: FieldMetadataType.EMAILS,
        objectMetadataUniversalIdentifier: 'personObject',
      },
    },
  },
  flatIndexMaps: {
    byUniversalIdentifier: isUnique
      ? {
          emailIndex: {
            isUnique: true,
            indexWhereClause: null,
            flatIndexFieldMetadatas: [
              {
                fieldMetadataId: FIELD_ID,
                subFieldName: null,
              },
            ],
          },
        }
      : {},
  },
  flatObjectMetadataMaps: {
    byUniversalIdentifier: {
      personObject: {
        nameSingular: 'person',
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION.universalIdentifier,
      },
    },
  },
});

const createCommand = ({
  collisionCount = 0,
  dryRun = false,
  isUnique = false,
}: {
  collisionCount?: number;
  dryRun?: boolean;
  isUnique?: boolean;
} = {}) => {
  let recordSelectCount = 0;
  const query = jest.fn(
    async (sql: string, _parameters?: unknown[], structured?: boolean) => {
      if (sql.includes('SELECT "id"')) {
        recordSelectCount++;

        return recordSelectCount === 1
          ? [
              {
                id: '20202020-0000-0000-0000-000000000003',
                primaryEmail: 'admin@💩.la',
                additionalEmails: ['user@例え.テスト'],
              },
            ]
          : [];
      }

      if (sql.includes('SELECT count(*)')) {
        return [{ collisionCount }];
      }

      if (structured && sql.includes('UPDATE')) {
        return { affected: 1 };
      }

      return [];
    },
  );
  const queryRunner = {
    connect: jest.fn(),
    query,
    release: jest.fn(),
  } as unknown as QueryRunner;
  const dataSource = {
    createQueryRunner: jest.fn(() => queryRunner),
  } as unknown as DataSource;
  const workspaceCacheService = {
    getOrRecompute: jest.fn().mockResolvedValue(buildCache(isUnique)),
  } as unknown as WorkspaceCacheService;
  const command = new CanonicalizeEmailDomainsCommand(
    {} as WorkspaceIteratorService,
    workspaceCacheService,
  );
  const run = () =>
    command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      dataSource,
      options: { dryRun },
      index: 0,
      total: 1,
    });

  return { query, queryRunner, run };
};

describe('CanonicalizeEmailDomainsCommand', () => {
  it('stages canonical values and updates the EMAILS field', async () => {
    const { query, queryRunner, run } = createCommand();

    await run();

    const insertCall = query.mock.calls.find(([sql]) =>
      sql.includes('INSERT INTO'),
    );

    expect(insertCall?.[1]).toEqual([
      '20202020-0000-0000-0000-000000000003',
      'admin@xn--ls8h.la',
      '["user@xn--r8jz45g.xn--zckzah"]',
      'admin@💩.la',
      '["user@例え.テスト"]',
    ]);
    expect(query.mock.calls.some(([sql]) => sql.includes('UPDATE'))).toBe(
      true,
    );
    expect(queryRunner.release).toHaveBeenCalled();
  });

  it('scans and stages values without updating in dry-run mode', async () => {
    const { query, run } = createCommand({ dryRun: true });

    await run();

    expect(query.mock.calls.some(([sql]) => sql.includes('INSERT INTO'))).toBe(
      true,
    );
    expect(query.mock.calls.some(([sql]) => sql.includes('UPDATE'))).toBe(
      false,
    );
  });

  it('stops before updating when canonical values collide', async () => {
    const { query, queryRunner, run } = createCommand({
      collisionCount: 1,
      isUnique: true,
    });

    await expect(run()).rejects.toThrow(
      'equivalent email values would collide under its unique index',
    );
    expect(query.mock.calls.some(([sql]) => sql.includes('UPDATE'))).toBe(
      false,
    );
    expect(queryRunner.release).toHaveBeenCalled();
  });
});
