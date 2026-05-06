import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UpgradeHealthEnum } from 'twenty-shared/types';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const LAST_INSTANCE_COMMAND = '1.23.0_LastInstanceCommand_1780000002000';
const LAST_WORKSPACE_COMMAND = '1.23.0_LastWorkspaceCommand_1780000003000';
const EARLIER_COMMAND = '1.22.0_EarlierCommand_1776000001000';

const MOCK_SEQUENCE = [
  { kind: 'fast-instance', name: EARLIER_COMMAND },
  { kind: 'fast-instance', name: LAST_INSTANCE_COMMAND },
  { kind: 'workspace', name: LAST_WORKSPACE_COMMAND },
];

type WorkspaceRecord = {
  id: string;
  displayName: string | null;
};

const buildWorkspaceCacheGetMock = (
  workspaces: WorkspaceRecord[],
): jest.Mock => {
  const byId = new Map(
    workspaces.map((workspace) => [workspace.id, workspace]),
  );

  return jest.fn(async (_cacheKey: string, workspaceId: string) => {
    const workspace = byId.get(workspaceId);

    if (!workspace) {
      return null;
    }

    return {
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      ...workspace,
    };
  });
};

describe('UpgradeStatusService', () => {
  let service: UpgradeStatusService;
  let getLastAttemptedInstanceCommand: jest.Mock;
  let getWorkspaceLastAttemptedCommandName: jest.Mock;
  let workspaceFind: jest.Mock;
  let coreEntityCacheGet: jest.Mock;
  let cacheGetComputedAt: jest.Mock;
  let cacheGetBehindWorkspaceIds: jest.Mock;
  let cacheGetFailedWorkspaceIds: jest.Mock;
  let cacheWrite: jest.Mock;
  let cacheInvalidate: jest.Mock;

  const mockActiveWorkspaces = (workspaces: WorkspaceRecord[]) => {
    workspaceFind.mockResolvedValue(workspaces);
    coreEntityCacheGet.mockImplementation(
      buildWorkspaceCacheGetMock(workspaces),
    );
  };

  beforeEach(async () => {
    getLastAttemptedInstanceCommand = jest.fn();
    getWorkspaceLastAttemptedCommandName = jest.fn();
    workspaceFind = jest.fn().mockResolvedValue([]);
    coreEntityCacheGet = jest.fn().mockResolvedValue(null);
    cacheGetComputedAt = jest.fn();
    cacheGetBehindWorkspaceIds = jest.fn().mockResolvedValue([]);
    cacheGetFailedWorkspaceIds = jest.fn().mockResolvedValue([]);
    cacheWrite = jest.fn().mockResolvedValue(undefined);
    cacheInvalidate = jest.fn().mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        UpgradeStatusService,
        {
          provide: UpgradeMigrationService,
          useValue: {
            getLastAttemptedInstanceCommand,
            getWorkspaceLastAttemptedCommandName,
          },
        },
        {
          provide: UpgradeSequenceReaderService,
          useValue: {
            getUpgradeSequence: () => MOCK_SEQUENCE,
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: { find: workspaceFind },
        },
        {
          provide: CoreEntityCacheService,
          useValue: { get: coreEntityCacheGet },
        },
        {
          provide: UpgradeStatusCacheService,
          useValue: {
            getComputedAt: cacheGetComputedAt,
            getBehindWorkspaceIds: cacheGetBehindWorkspaceIds,
            getFailedWorkspaceIds: cacheGetFailedWorkspaceIds,
            write: cacheWrite,
            invalidate: cacheInvalidate,
          },
        },
      ],
    }).compile();

    service = module.get(UpgradeStatusService);
  });

  describe('getInstanceStatus', () => {
    it('should return up-to-date when cursor is at last instance command', async () => {
      getLastAttemptedInstanceCommand.mockResolvedValue({
        name: LAST_INSTANCE_COMMAND,
        status: 'completed',
        executedByVersion: '1.23.0',
        errorMessage: null,
        createdAt: new Date('2025-06-01T00:00:00Z'),
      });

      const result = await service.getInstanceStatus();

      expect(result.health).toBe(UpgradeHealthEnum.UP_TO_DATE);
      expect(result.inferredVersion).toBe('1.23.0');
    });

    it('should return behind when cursor is before last instance command', async () => {
      getLastAttemptedInstanceCommand.mockResolvedValue({
        name: EARLIER_COMMAND,
        status: 'completed',
        executedByVersion: '1.22.0',
        errorMessage: null,
        createdAt: new Date('2025-06-01T00:00:00Z'),
      });

      const result = await service.getInstanceStatus();

      expect(result.health).toBe(UpgradeHealthEnum.BEHIND);
      expect(result.inferredVersion).toBe('1.22.0');
    });

    it('should return failed when latest instance command failed', async () => {
      getLastAttemptedInstanceCommand.mockResolvedValue({
        name: LAST_INSTANCE_COMMAND,
        status: 'failed',
        executedByVersion: '1.23.0',
        errorMessage: 'column does not exist',
        createdAt: new Date('2025-06-01T01:00:00Z'),
      });

      const result = await service.getInstanceStatus();

      expect(result.health).toBe(UpgradeHealthEnum.FAILED);
      expect(result.latestCommand?.errorMessage).toBe('column does not exist');
    });

    it('should return behind when no migrations exist', async () => {
      getLastAttemptedInstanceCommand.mockResolvedValue(null);

      const result = await service.getInstanceStatus();

      expect(result.health).toBe(UpgradeHealthEnum.BEHIND);
      expect(result.inferredVersion).toBeNull();
      expect(result.latestCommand).toBeNull();
    });
  });

  describe('getWorkspaceStatuses', () => {
    it('should return up-to-date for workspace at last command', async () => {
      mockActiveWorkspaces([{ id: 'ws-1', displayName: 'Apple' }]);

      getWorkspaceLastAttemptedCommandName.mockResolvedValue(
        new Map([
          [
            'ws-1',
            {
              workspaceId: 'ws-1',
              name: LAST_WORKSPACE_COMMAND,
              status: 'completed',
              executedByVersion: '1.23.0',
              errorMessage: null,
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
          ],
        ]),
      );

      const results = await service.getWorkspaceStatuses();

      expect(results).toHaveLength(1);
      expect(results[0].health).toBe(UpgradeHealthEnum.UP_TO_DATE);
    });

    it('should return behind for workspace not at last command', async () => {
      mockActiveWorkspaces([
        { id: 'ws-1', displayName: 'Apple' },
        { id: 'ws-2', displayName: 'Google' },
      ]);

      getWorkspaceLastAttemptedCommandName.mockResolvedValue(
        new Map([
          [
            'ws-1',
            {
              workspaceId: 'ws-1',
              name: LAST_WORKSPACE_COMMAND,
              status: 'completed',
              executedByVersion: '1.23.0',
              errorMessage: null,
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
          ],
          [
            'ws-2',
            {
              workspaceId: 'ws-2',
              name: EARLIER_COMMAND,
              status: 'completed',
              executedByVersion: '1.22.0',
              errorMessage: null,
              createdAt: new Date('2025-05-01T00:00:00Z'),
            },
          ],
        ]),
      );

      const results = await service.getWorkspaceStatuses();

      expect(results).toHaveLength(2);
      expect(results[0].health).toBe(UpgradeHealthEnum.UP_TO_DATE);
      expect(results[1].health).toBe(UpgradeHealthEnum.BEHIND);
    });

    it('should return behind for workspace with no migration history', async () => {
      mockActiveWorkspaces([{ id: 'ws-1', displayName: 'Apple' }]);

      getWorkspaceLastAttemptedCommandName.mockResolvedValue(new Map());

      const results = await service.getWorkspaceStatuses();

      expect(results).toHaveLength(1);
      expect(results[0].health).toBe(UpgradeHealthEnum.BEHIND);
      expect(results[0].latestCommand).toBeNull();
    });

    it('should return empty array when no workspaces exist', async () => {
      mockActiveWorkspaces([]);
      getWorkspaceLastAttemptedCommandName.mockResolvedValue(new Map());

      const results = await service.getWorkspaceStatuses();

      expect(results).toHaveLength(0);
    });
  });

  describe('getInstanceAndAllWorkspacesStatus', () => {
    it('should hydrate cached behind/failed ids with display names without calling getWorkspaceStatuses', async () => {
      const computedAt = new Date('2025-06-02T10:00:00Z');

      cacheGetComputedAt.mockResolvedValue(computedAt);
      cacheGetBehindWorkspaceIds.mockResolvedValue(['ws-2']);
      cacheGetFailedWorkspaceIds.mockResolvedValue(['ws-3']);
      getLastAttemptedInstanceCommand.mockResolvedValue({
        name: LAST_INSTANCE_COMMAND,
        status: 'completed',
        executedByVersion: '1.23.0',
        errorMessage: null,
        createdAt: new Date('2025-06-01T00:00:00Z'),
      });
      coreEntityCacheGet.mockImplementation(
        buildWorkspaceCacheGetMock([
          { id: 'ws-2', displayName: 'Banana' },
          { id: 'ws-3', displayName: 'Cherry' },
        ]),
      );

      const result = await service.getInstanceAndAllWorkspacesStatus();

      expect(result.workspacesBehind).toEqual([{ id: 'ws-2', name: 'Banana' }]);
      expect(result.workspacesFailed).toEqual([{ id: 'ws-3', name: 'Cherry' }]);
      expect(result.computedAt).toEqual(computedAt);
      expect(getWorkspaceLastAttemptedCommandName).not.toHaveBeenCalled();
      expect(cacheWrite).not.toHaveBeenCalled();
    });

    it('should fall back to a refresh when the cache marker is missing', async () => {
      cacheGetComputedAt.mockResolvedValue(null);
      getLastAttemptedInstanceCommand.mockResolvedValue(null);
      mockActiveWorkspaces([{ id: 'ws-1', displayName: 'Apple' }]);
      getWorkspaceLastAttemptedCommandName.mockResolvedValue(new Map());

      const result = await service.getInstanceAndAllWorkspacesStatus();

      expect(cacheWrite).toHaveBeenCalledTimes(1);
      expect(result.workspacesBehind).toEqual([{ id: 'ws-1', name: 'Apple' }]);
    });

    it('should use null name when a cached id is missing from the cache', async () => {
      cacheGetComputedAt.mockResolvedValue(new Date());
      cacheGetBehindWorkspaceIds.mockResolvedValue(['ws-orphan']);
      getLastAttemptedInstanceCommand.mockResolvedValue(null);
      coreEntityCacheGet.mockResolvedValue(null);

      const result = await service.getInstanceAndAllWorkspacesStatus();

      expect(result.workspacesBehind).toEqual([
        { id: 'ws-orphan', name: null },
      ]);
    });

    it('should not query workspace names when both cached id sets are empty', async () => {
      cacheGetComputedAt.mockResolvedValue(new Date());
      getLastAttemptedInstanceCommand.mockResolvedValue(null);

      await service.getInstanceAndAllWorkspacesStatus();

      expect(coreEntityCacheGet).not.toHaveBeenCalled();
    });
  });

  describe('refreshInstanceAndAllWorkspacesStatus', () => {
    it('should partition workspaces by health, write to cache, and return the fresh payload', async () => {
      getLastAttemptedInstanceCommand.mockResolvedValue(null);
      mockActiveWorkspaces([
        { id: 'ws-1', displayName: 'Apple' },
        { id: 'ws-2', displayName: 'Banana' },
        { id: 'ws-3', displayName: 'Cherry' },
      ]);
      getWorkspaceLastAttemptedCommandName.mockResolvedValue(
        new Map([
          [
            'ws-1',
            {
              workspaceId: 'ws-1',
              name: LAST_WORKSPACE_COMMAND,
              status: 'completed',
              executedByVersion: '1.23.0',
              errorMessage: null,
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
          ],
          [
            'ws-2',
            {
              workspaceId: 'ws-2',
              name: EARLIER_COMMAND,
              status: 'completed',
              executedByVersion: '1.22.0',
              errorMessage: null,
              createdAt: new Date('2025-05-01T00:00:00Z'),
            },
          ],
          [
            'ws-3',
            {
              workspaceId: 'ws-3',
              name: LAST_WORKSPACE_COMMAND,
              status: 'failed',
              executedByVersion: '1.23.0',
              errorMessage: 'boom',
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
          ],
        ]),
      );

      const result = await service.refreshInstanceAndAllWorkspacesStatus();

      expect(result.workspacesBehind).toEqual([{ id: 'ws-2', name: 'Banana' }]);
      expect(result.workspacesFailed).toEqual([{ id: 'ws-3', name: 'Cherry' }]);

      expect(cacheWrite).toHaveBeenCalledWith({
        behindWorkspaceIds: ['ws-2'],
        failedWorkspaceIds: ['ws-3'],
        computedAt: expect.any(Date),
      });
    });
  });

  describe('invalidateInstanceAndAllWorkspacesStatus', () => {
    it('should delegate to the cache service', async () => {
      await service.invalidateInstanceAndAllWorkspacesStatus();

      expect(cacheInvalidate).toHaveBeenCalledTimes(1);
    });
  });
});
