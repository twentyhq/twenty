import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UpgradeHealthEnum } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS } from 'src/engine/core-modules/upgrade/constants/twenty-cross-upgrade-supported-version.constant';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// The three most recent supported versions: the upgrade sequence only ever
// covers supported versions, so fixtures built out of anything else describe a
// state the server cannot reach.
const [OLDEST_VERSION, MIDDLE_VERSION, NEWEST_VERSION] =
  TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS.slice(-3);

const OLDEST_INSTANCE_COMMAND = `${OLDEST_VERSION}_InstanceCommand_1772000001000`;
const OLDEST_SLOW_INSTANCE_COMMAND = `${OLDEST_VERSION}_SlowInstanceCommand_1772000002000`;
const OLDEST_FIRST_WORKSPACE_COMMAND = `${OLDEST_VERSION}_FirstWorkspaceCommand_1772000003000`;
const OLDEST_SECOND_WORKSPACE_COMMAND = `${OLDEST_VERSION}_SecondWorkspaceCommand_1772000004000`;
const MIDDLE_INSTANCE_COMMAND = `${MIDDLE_VERSION}_InstanceCommand_1776000001000`;
const NEWEST_INSTANCE_COMMAND = `${NEWEST_VERSION}_InstanceCommand_1780000002000`;
const NEWEST_WORKSPACE_COMMAND = `${NEWEST_VERSION}_WorkspaceCommand_1780000003000`;

// Three version segments: the oldest has multiple workspace commands, the
// middle one is instance-only, the newest ends the sequence with a workspace
// command.
const MOCK_SEQUENCE = [
  { kind: 'fast-instance', name: OLDEST_INSTANCE_COMMAND },
  { kind: 'slow-instance', name: OLDEST_SLOW_INSTANCE_COMMAND },
  { kind: 'workspace', name: OLDEST_FIRST_WORKSPACE_COMMAND },
  { kind: 'workspace', name: OLDEST_SECOND_WORKSPACE_COMMAND },
  { kind: 'fast-instance', name: MIDDLE_INSTANCE_COMMAND },
  { kind: 'fast-instance', name: NEWEST_INSTANCE_COMMAND },
  { kind: 'workspace', name: NEWEST_WORKSPACE_COMMAND },
];

// The newest supported version ships workspace commands only: nothing for the
// instance cursor to land on.
const MOCK_SEQUENCE_WITHOUT_TRAILING_INSTANCE_COMMAND = [
  { kind: 'fast-instance', name: MIDDLE_INSTANCE_COMMAND },
  { kind: 'workspace', name: NEWEST_WORKSPACE_COMMAND },
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
  let sequence: { kind: string; name: string }[];
  let getLastAttemptedInstanceCommand: jest.Mock;
  let getWorkspaceLastAttemptedCommandName: jest.Mock;
  let workspaceFind: jest.Mock;
  let coreEntityCacheGet: jest.Mock;
  let cacheGetComputedAt: jest.Mock;
  let cacheGetBehindWorkspaceIds: jest.Mock;
  let cacheGetFailedWorkspaceIds: jest.Mock;
  let cacheGetUpToDateWorkspaceCount: jest.Mock;
  let cacheWrite: jest.Mock;
  let cacheInvalidate: jest.Mock;

  const mockActiveWorkspaces = (workspaces: WorkspaceRecord[]) => {
    workspaceFind.mockResolvedValue(workspaces);
    coreEntityCacheGet.mockImplementation(
      buildWorkspaceCacheGetMock(workspaces),
    );
  };

  beforeEach(async () => {
    sequence = MOCK_SEQUENCE;
    getLastAttemptedInstanceCommand = jest.fn();
    getWorkspaceLastAttemptedCommandName = jest.fn();
    workspaceFind = jest.fn().mockResolvedValue([]);
    coreEntityCacheGet = jest.fn().mockResolvedValue(null);
    cacheGetComputedAt = jest.fn();
    cacheGetBehindWorkspaceIds = jest.fn().mockResolvedValue([]);
    cacheGetFailedWorkspaceIds = jest.fn().mockResolvedValue([]);
    cacheGetUpToDateWorkspaceCount = jest.fn().mockResolvedValue(0);
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
            getUpgradeSequence: () => sequence,
            getUpgradeStepNames: (kinds?: Record<string, true>) =>
              sequence
                .filter(
                  (step) => !isDefined(kinds) || kinds[step.kind] === true,
                )
                .map((step) => step.name),
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
            getUpToDateWorkspaceCount: cacheGetUpToDateWorkspaceCount,
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
        name: NEWEST_INSTANCE_COMMAND,
        status: 'completed',
        executedByVersion: NEWEST_VERSION,
        errorMessage: null,
        createdAt: new Date('2025-06-01T00:00:00Z'),
      });

      const result = await service.getInstanceStatus();

      expect(result.health).toBe(UpgradeHealthEnum.UP_TO_DATE);
      expect(result.inferredVersion).toBe(NEWEST_VERSION);
    });

    it('should return behind when cursor is before last instance command', async () => {
      getLastAttemptedInstanceCommand.mockResolvedValue({
        name: MIDDLE_INSTANCE_COMMAND,
        status: 'completed',
        executedByVersion: MIDDLE_VERSION,
        errorMessage: null,
        createdAt: new Date('2025-06-01T00:00:00Z'),
      });

      const result = await service.getInstanceStatus();

      expect(result.health).toBe(UpgradeHealthEnum.BEHIND);
      expect(result.inferredVersion).toBe(MIDDLE_VERSION);
    });

    it('should return failed when latest instance command failed', async () => {
      getLastAttemptedInstanceCommand.mockResolvedValue({
        name: NEWEST_INSTANCE_COMMAND,
        status: 'failed',
        executedByVersion: NEWEST_VERSION,
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

  describe('getInstanceCompletedVersion', () => {
    const mockInstanceCursor = (
      cursor: { name: string; status: 'completed' | 'failed' } | null,
    ) => {
      getLastAttemptedInstanceCommand.mockResolvedValue(
        cursor === null
          ? null
          : {
              ...cursor,
              executedByVersion: NEWEST_VERSION,
              errorMessage: null,
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
      );
    };

    it('should return null when no instance command has run', async () => {
      mockInstanceCursor(null);

      await expect(service.getInstanceCompletedVersion()).resolves.toBeNull();
    });

    it('should return the cursor version when completed at the last instance step of its segment', async () => {
      mockInstanceCursor({
        name: NEWEST_INSTANCE_COMMAND,
        status: 'completed',
      });

      await expect(service.getInstanceCompletedVersion()).resolves.toBe(
        NEWEST_VERSION,
      );
    });

    it('should ignore workspace steps of the same segment', async () => {
      mockInstanceCursor({
        name: OLDEST_SLOW_INSTANCE_COMMAND,
        status: 'completed',
      });

      await expect(service.getInstanceCompletedVersion()).resolves.toBe(
        OLDEST_VERSION,
      );
    });

    it('should return the previous version when the last instance step of the segment failed', async () => {
      mockInstanceCursor({ name: NEWEST_INSTANCE_COMMAND, status: 'failed' });

      await expect(service.getInstanceCompletedVersion()).resolves.toBe(
        MIDDLE_VERSION,
      );
    });

    it('should return null when earlier instance steps of the same segment remain', async () => {
      mockInstanceCursor({
        name: OLDEST_INSTANCE_COMMAND,
        status: 'completed',
      });

      await expect(service.getInstanceCompletedVersion()).resolves.toBeNull();
    });

    it('should reach a trailing version that declares no instance command', async () => {
      sequence = MOCK_SEQUENCE_WITHOUT_TRAILING_INSTANCE_COMMAND;
      mockInstanceCursor({
        name: MIDDLE_INSTANCE_COMMAND,
        status: 'completed',
      });

      await expect(service.getInstanceCompletedVersion()).resolves.toBe(
        NEWEST_VERSION,
      );
    });

    it('should not reach a trailing version whose instance command has not run', async () => {
      sequence = [
        { kind: 'fast-instance', name: MIDDLE_INSTANCE_COMMAND },
        { kind: 'fast-instance', name: NEWEST_INSTANCE_COMMAND },
      ];
      mockInstanceCursor({
        name: MIDDLE_INSTANCE_COMMAND,
        status: 'completed',
      });

      await expect(service.getInstanceCompletedVersion()).resolves.toBe(
        MIDDLE_VERSION,
      );
    });

    it('should throw when a step name carries no version prefix', async () => {
      sequence = [{ kind: 'fast-instance', name: 'NoVersionPrefixCommand' }];
      mockInstanceCursor({
        name: 'NoVersionPrefixCommand',
        status: 'completed',
      });

      await expect(service.getInstanceCompletedVersion()).rejects.toThrow(
        'does not carry a version prefix',
      );
    });

    it('should throw when a step belongs to an unsupported version', async () => {
      const unsupportedCommand = '0.1.0_InstanceCommand_1700000000000';

      sequence = [{ kind: 'fast-instance', name: unsupportedCommand }];
      mockInstanceCursor({ name: unsupportedCommand, status: 'completed' });

      await expect(service.getInstanceCompletedVersion()).rejects.toThrow(
        'is not one of the supported versions',
      );
    });
  });

  describe('getWorkspaceCompletedVersion', () => {
    const mockWorkspaceCursor = (
      cursor: { name: string; status: 'completed' | 'failed' } | null,
    ) => {
      getWorkspaceLastAttemptedCommandName.mockResolvedValue(
        cursor === null
          ? new Map()
          : new Map([
              [
                'ws-1',
                {
                  workspaceId: 'ws-1',
                  ...cursor,
                  executedByVersion: NEWEST_VERSION,
                  errorMessage: null,
                  createdAt: new Date('2025-06-01T00:00:00Z'),
                  isInitial: false,
                },
              ],
            ]),
      );
    };

    it('should return the cursor version when at the last step of its segment with completed status', async () => {
      mockWorkspaceCursor({
        name: NEWEST_WORKSPACE_COMMAND,
        status: 'completed',
      });

      await expect(service.getWorkspaceCompletedVersion('ws-1')).resolves.toBe(
        NEWEST_VERSION,
      );
    });

    it('should return the immediately previous version when the cursor is mid-segment', async () => {
      mockWorkspaceCursor({
        name: NEWEST_INSTANCE_COMMAND,
        status: 'completed',
      });

      await expect(service.getWorkspaceCompletedVersion('ws-1')).resolves.toBe(
        MIDDLE_VERSION,
      );
    });

    it('should return the previous version when the last step of the segment failed', async () => {
      mockWorkspaceCursor({ name: NEWEST_WORKSPACE_COMMAND, status: 'failed' });

      await expect(service.getWorkspaceCompletedVersion('ws-1')).resolves.toBe(
        MIDDLE_VERSION,
      );
    });

    it('should return the cursor version when completed at the end of an instance-only segment', async () => {
      mockWorkspaceCursor({
        name: MIDDLE_INSTANCE_COMMAND,
        status: 'completed',
      });

      await expect(service.getWorkspaceCompletedVersion('ws-1')).resolves.toBe(
        MIDDLE_VERSION,
      );
    });

    it('should return the previous version when an instance-only segment failed', async () => {
      mockWorkspaceCursor({ name: MIDDLE_INSTANCE_COMMAND, status: 'failed' });

      await expect(service.getWorkspaceCompletedVersion('ws-1')).resolves.toBe(
        OLDEST_VERSION,
      );
    });

    it('should return the cursor version when completed at the last of several workspace commands', async () => {
      mockWorkspaceCursor({
        name: OLDEST_SECOND_WORKSPACE_COMMAND,
        status: 'completed',
      });

      await expect(service.getWorkspaceCompletedVersion('ws-1')).resolves.toBe(
        OLDEST_VERSION,
      );
    });

    it('should not consider a segment completed while earlier workspace commands of the same segment remain', async () => {
      mockWorkspaceCursor({
        name: OLDEST_FIRST_WORKSPACE_COMMAND,
        status: 'completed',
      });

      await expect(
        service.getWorkspaceCompletedVersion('ws-1'),
      ).resolves.toBeNull();
    });

    it('should return null when the first segment failed with no previous segment', async () => {
      mockWorkspaceCursor({
        name: OLDEST_SECOND_WORKSPACE_COMMAND,
        status: 'failed',
      });

      await expect(
        service.getWorkspaceCompletedVersion('ws-1'),
      ).resolves.toBeNull();
    });

    it('should return null when the workspace has no cursor', async () => {
      mockWorkspaceCursor(null);

      await expect(
        service.getWorkspaceCompletedVersion('ws-1'),
      ).resolves.toBeNull();
    });

    it('should return null when the cursor is outside the supported sequence', async () => {
      mockWorkspaceCursor({
        name: '1.10.0_OutOfSequenceCommand_1700000000000',
        status: 'completed',
      });

      await expect(
        service.getWorkspaceCompletedVersion('ws-1'),
      ).resolves.toBeNull();
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
              name: NEWEST_WORKSPACE_COMMAND,
              status: 'completed',
              executedByVersion: NEWEST_VERSION,
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
              name: NEWEST_WORKSPACE_COMMAND,
              status: 'completed',
              executedByVersion: NEWEST_VERSION,
              errorMessage: null,
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
          ],
          [
            'ws-2',
            {
              workspaceId: 'ws-2',
              name: MIDDLE_INSTANCE_COMMAND,
              status: 'completed',
              executedByVersion: MIDDLE_VERSION,
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
      cacheGetUpToDateWorkspaceCount.mockResolvedValue(5);
      getLastAttemptedInstanceCommand.mockResolvedValue({
        name: NEWEST_INSTANCE_COMMAND,
        status: 'completed',
        executedByVersion: NEWEST_VERSION,
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
      expect(result.upToDateWorkspaceCount).toBe(5);
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
              name: NEWEST_WORKSPACE_COMMAND,
              status: 'completed',
              executedByVersion: NEWEST_VERSION,
              errorMessage: null,
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
          ],
          [
            'ws-2',
            {
              workspaceId: 'ws-2',
              name: MIDDLE_INSTANCE_COMMAND,
              status: 'completed',
              executedByVersion: MIDDLE_VERSION,
              errorMessage: null,
              createdAt: new Date('2025-05-01T00:00:00Z'),
            },
          ],
          [
            'ws-3',
            {
              workspaceId: 'ws-3',
              name: NEWEST_WORKSPACE_COMMAND,
              status: 'failed',
              executedByVersion: NEWEST_VERSION,
              errorMessage: 'boom',
              createdAt: new Date('2025-06-01T00:00:00Z'),
            },
          ],
        ]),
      );

      const result = await service.refreshInstanceAndAllWorkspacesStatus();

      expect(result.workspacesBehind).toEqual([{ id: 'ws-2', name: 'Banana' }]);
      expect(result.workspacesFailed).toEqual([{ id: 'ws-3', name: 'Cherry' }]);
      expect(result.upToDateWorkspaceCount).toBe(1);

      expect(cacheWrite).toHaveBeenCalledWith({
        behindWorkspaceIds: ['ws-2'],
        failedWorkspaceIds: ['ws-3'],
        upToDateWorkspaceCount: 1,
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
