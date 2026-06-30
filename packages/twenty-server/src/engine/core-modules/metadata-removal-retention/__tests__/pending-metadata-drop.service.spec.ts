import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';
import { Test, type TestingModule } from '@nestjs/testing';

import { PendingMetadataDropEntity } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.entity';
import { PendingMetadataDropService } from 'src/engine/core-modules/metadata-removal-retention/pending-metadata-drop.service';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';

const buildColumnEntry = (
  overrides: Partial<PendingMetadataDropEntity> = {},
): PendingMetadataDropEntity =>
  ({
    id: 'entry-id',
    kind: 'COLUMN',
    schemaName: 'workspace_1',
    tableName: '_invoice',
    columnNames: ['amount'],
    enumNames: ['workspace_1._invoice_amount_enum'],
    columnDefinitions: [{ name: 'amount', type: 'text' }],
    applicationId: null,
    removedAt: new Date('2026-06-01T00:00:00.000Z'),
    scheduledDropAt: new Date('2026-06-08T00:00:00.000Z'),
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    workspaceId: 'workspace-id',
    ...overrides,
  }) as PendingMetadataDropEntity;

describe('PendingMetadataDropService', () => {
  let service: PendingMetadataDropService;
  let scopedRepository: {
    findOne: jest.Mock;
    delete: jest.Mock;
    insert: jest.Mock;
  };
  let rootRepository: { find: jest.Mock };
  let columnManager: { dropColumns: jest.Mock };
  let tableManager: { dropTable: jest.Mock };
  let enumManager: { dropEnum: jest.Mock };
  let queryRunner: {
    manager: { getRepository: jest.Mock };
    connect: jest.Mock;
    startTransaction: jest.Mock;
    commitTransaction: jest.Mock;
    rollbackTransaction: jest.Mock;
    release: jest.Mock;
  };

  beforeEach(async () => {
    scopedRepository = {
      findOne: jest.fn(),
      delete: jest.fn(),
      insert: jest.fn(),
    };
    rootRepository = { find: jest.fn() };
    columnManager = { dropColumns: jest.fn() };
    tableManager = { dropTable: jest.fn() };
    enumManager = { dropEnum: jest.fn() };
    queryRunner = {
      manager: { getRepository: jest.fn().mockReturnValue(scopedRepository) },
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendingMetadataDropService,
        {
          provide: getRepositoryToken(PendingMetadataDropEntity),
          useValue: rootRepository,
        },
        {
          provide: WorkspaceSchemaManagerService,
          useValue: { columnManager, tableManager, enumManager },
        },
        {
          provide: getDataSourceToken(),
          useValue: { createQueryRunner: () => queryRunner },
        },
      ],
    }).compile();

    service = module.get(PendingMetadataDropService);
  });

  describe('recordColumnDrop', () => {
    it('schedules the drop retentionDays after removal and stores it in the migration transaction', async () => {
      await service.recordColumnDrop({
        queryRunner: queryRunner as never,
        workspaceId: 'workspace-id',
        applicationId: 'app-id',
        schemaName: 'workspace_1',
        tableName: '_invoice',
        columnNames: ['amount'],
        enumNames: [],
        columnDefinitions: [{ name: 'amount', type: 'text' }],
        retentionDays: 7,
      });

      expect(queryRunner.manager.getRepository).toHaveBeenCalledWith(
        PendingMetadataDropEntity,
      );
      expect(scopedRepository.insert).toHaveBeenCalledTimes(1);

      const inserted = scopedRepository.insert.mock.calls[0][0];

      expect(inserted.kind).toBe('COLUMN');
      expect(inserted.columnNames).toEqual(['amount']);

      const elapsedDays =
        (inserted.scheduledDropAt.getTime() - inserted.removedAt.getTime()) /
        (24 * 60 * 60 * 1000);

      expect(elapsedDays).toBe(7);
    });
  });

  describe('reclaimColumns', () => {
    it('returns none and drops nothing when there is no pending entry', async () => {
      scopedRepository.findOne.mockResolvedValue(null);

      const outcome = await service.reclaimColumns({
        queryRunner: queryRunner as never,
        workspaceId: 'workspace-id',
        schemaName: 'workspace_1',
        tableName: '_invoice',
        columnNames: ['amount'],
        columnDefinitions: [{ name: 'amount', type: 'text' }],
      });

      expect(outcome).toBe('none');
      expect(columnManager.dropColumns).not.toHaveBeenCalled();
      expect(scopedRepository.delete).not.toHaveBeenCalled();
    });

    it('reuses the retained column and cancels the drop when the definition is identical', async () => {
      scopedRepository.findOne.mockResolvedValue(buildColumnEntry());

      const outcome = await service.reclaimColumns({
        queryRunner: queryRunner as never,
        workspaceId: 'workspace-id',
        schemaName: 'workspace_1',
        tableName: '_invoice',
        columnNames: ['amount'],
        columnDefinitions: [{ name: 'amount', type: 'text' }],
      });

      expect(outcome).toBe('reused');
      expect(columnManager.dropColumns).not.toHaveBeenCalled();
      expect(scopedRepository.delete).toHaveBeenCalledWith('entry-id');
    });

    it('reuses the column when the stored definition only differs by key order', async () => {
      scopedRepository.findOne.mockResolvedValue(
        buildColumnEntry({
          columnDefinitions: [{ type: 'text', name: 'amount' } as never],
        }),
      );

      const outcome = await service.reclaimColumns({
        queryRunner: queryRunner as never,
        workspaceId: 'workspace-id',
        schemaName: 'workspace_1',
        tableName: '_invoice',
        columnNames: ['amount'],
        columnDefinitions: [{ name: 'amount', type: 'text' }],
      });

      expect(outcome).toBe('reused');
      expect(columnManager.dropColumns).not.toHaveBeenCalled();
    });

    it('drops the stale column when the re-added definition differs', async () => {
      scopedRepository.findOne.mockResolvedValue(buildColumnEntry());

      const outcome = await service.reclaimColumns({
        queryRunner: queryRunner as never,
        workspaceId: 'workspace-id',
        schemaName: 'workspace_1',
        tableName: '_invoice',
        columnNames: ['amount'],
        columnDefinitions: [{ name: 'amount', type: 'numeric' }],
      });

      expect(outcome).toBe('dropped');
      expect(columnManager.dropColumns).toHaveBeenCalledWith(
        expect.objectContaining({ columnNames: ['amount'], cascade: true }),
      );
      expect(enumManager.dropEnum).toHaveBeenCalledTimes(1);
      expect(scopedRepository.delete).toHaveBeenCalledWith('entry-id');
    });

    it('returns none when a pending entry targets different columns', async () => {
      scopedRepository.findOne.mockResolvedValue(
        buildColumnEntry({ columnNames: ['other'] }),
      );

      const outcome = await service.reclaimColumns({
        queryRunner: queryRunner as never,
        workspaceId: 'workspace-id',
        schemaName: 'workspace_1',
        tableName: '_invoice',
        columnNames: ['amount'],
        columnDefinitions: [{ name: 'amount', type: 'text' }],
      });

      expect(outcome).toBe('none');
      expect(columnManager.dropColumns).not.toHaveBeenCalled();
    });
  });

  describe('findWorkspaceIdsWithDueDrops', () => {
    it('returns the distinct workspace ids with due drops', async () => {
      rootRepository.find.mockResolvedValue([
        { workspaceId: 'a' },
        { workspaceId: 'a' },
        { workspaceId: 'b' },
      ]);

      const workspaceIds = await service.findWorkspaceIdsWithDueDrops(
        new Date('2026-06-30T00:00:00.000Z'),
      );

      expect(workspaceIds).toEqual(['a', 'b']);
    });
  });

  describe('dropDueForWorkspace', () => {
    it('does nothing when there are no due drops', async () => {
      rootRepository.find.mockResolvedValue([]);

      await service.dropDueForWorkspace({
        workspaceId: 'workspace-id',
        now: new Date('2026-06-30T00:00:00.000Z'),
      });

      expect(queryRunner.connect).not.toHaveBeenCalled();
      expect(columnManager.dropColumns).not.toHaveBeenCalled();
    });

    it('drops each due column and table then removes the ledger row in its own transaction', async () => {
      rootRepository.find.mockResolvedValue([
        buildColumnEntry({ id: 'col-entry' }),
        buildColumnEntry({
          id: 'table-entry',
          kind: 'TABLE',
          columnNames: [],
        }),
      ]);

      await service.dropDueForWorkspace({
        workspaceId: 'workspace-id',
        now: new Date('2026-06-30T00:00:00.000Z'),
      });

      expect(columnManager.dropColumns).toHaveBeenCalledTimes(1);
      expect(tableManager.dropTable).toHaveBeenCalledTimes(1);
      expect(scopedRepository.delete).toHaveBeenCalledWith('col-entry');
      expect(scopedRepository.delete).toHaveBeenCalledWith('table-entry');
      expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(2);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });

    it('rolls back and keeps the ledger row when a drop fails', async () => {
      rootRepository.find.mockResolvedValue([buildColumnEntry()]);
      columnManager.dropColumns.mockRejectedValue(new Error('boom'));

      await service.dropDueForWorkspace({
        workspaceId: 'workspace-id',
        now: new Date('2026-06-30T00:00:00.000Z'),
      });

      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      expect(scopedRepository.delete).not.toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
    });
  });
});
