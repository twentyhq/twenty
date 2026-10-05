import { UpgradeHealthEnum } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { type UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { type UpgradeStatusCacheService } from 'src/engine/core-modules/upgrade/services/upgrade-status-cache.service';
import {
  type InstanceUpgradeStatus,
  UpgradeStatusService,
} from 'src/engine/core-modules/upgrade/services/upgrade-status.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const INSTANCE_UPGRADE_STATUS: InstanceUpgradeStatus = {
  inferredVersion: '2.47.0',
  health: UpgradeHealthEnum.UP_TO_DATE,
  latestCommand: null,
};

describe('UpgradeStatusService', () => {
  describe('getInstanceAndWorkspaceCountsStatus', () => {
    let upgradeStatusCacheService: jest.Mocked<
      Pick<
        UpgradeStatusCacheService,
        | 'getComputedAt'
        | 'getBehindWorkspaceIds'
        | 'getFailedWorkspaceIds'
        | 'getUpToDateWorkspaceCount'
        | 'tryAcquireRefreshLock'
        | 'releaseRefreshLock'
      >
    >;
    let service: UpgradeStatusService;
    let refreshSpy: jest.SpyInstance;

    beforeEach(() => {
      upgradeStatusCacheService = {
        getComputedAt: jest.fn(),
        getBehindWorkspaceIds: jest.fn().mockResolvedValue(['behind-id']),
        getFailedWorkspaceIds: jest.fn().mockResolvedValue([]),
        getUpToDateWorkspaceCount: jest.fn().mockResolvedValue(3),
        tryAcquireRefreshLock: jest.fn(),
        releaseRefreshLock: jest.fn().mockResolvedValue(undefined),
      };

      service = new UpgradeStatusService(
        {} as UpgradeMigrationService,
        {} as UpgradeSequenceReaderService,
        {} as Repository<WorkspaceEntity>,
        upgradeStatusCacheService as unknown as UpgradeStatusCacheService,
      );

      jest
        .spyOn(service, 'getInstanceStatus')
        .mockResolvedValue(INSTANCE_UPGRADE_STATUS);

      refreshSpy = jest
        .spyOn(service, 'refreshInstanceAndAllWorkspacesStatus')
        .mockResolvedValue({
          instanceUpgradeStatus: INSTANCE_UPGRADE_STATUS,
          workspacesBehind: [],
          workspacesFailed: [{ id: 'failed-id', name: null }],
          upToDateWorkspaceCount: 7,
          computedAt: new Date('2026-10-05T12:00:00Z'),
        });
    });

    it('should read counts from the shared cache without refreshing', async () => {
      upgradeStatusCacheService.getComputedAt.mockResolvedValue(
        new Date('2026-10-05T11:00:00Z'),
      );

      const status = await service.getInstanceAndWorkspaceCountsStatus();

      expect(status).toMatchObject({
        behindWorkspaceCount: 1,
        failedWorkspaceCount: 0,
        upToDateWorkspaceCount: 3,
      });
      expect(
        upgradeStatusCacheService.tryAcquireRefreshLock,
      ).not.toHaveBeenCalled();
      expect(refreshSpy).not.toHaveBeenCalled();
    });

    it('should refresh and release the lock when it wins the refresh lock', async () => {
      upgradeStatusCacheService.getComputedAt.mockResolvedValue(null);
      upgradeStatusCacheService.tryAcquireRefreshLock.mockResolvedValue(true);

      const status = await service.getInstanceAndWorkspaceCountsStatus();

      expect(refreshSpy).toHaveBeenCalledTimes(1);
      expect(status).toMatchObject({
        behindWorkspaceCount: 0,
        failedWorkspaceCount: 1,
        upToDateWorkspaceCount: 7,
      });
      expect(upgradeStatusCacheService.releaseRefreshLock).toHaveBeenCalled();
    });

    it('should release the lock when the refresh fails', async () => {
      upgradeStatusCacheService.getComputedAt.mockResolvedValue(null);
      upgradeStatusCacheService.tryAcquireRefreshLock.mockResolvedValue(true);
      refreshSpy.mockRejectedValue(new Error('Query read timeout'));

      await expect(
        service.getInstanceAndWorkspaceCountsStatus(),
      ).rejects.toThrow('Query read timeout');
      expect(upgradeStatusCacheService.releaseRefreshLock).toHaveBeenCalled();
    });

    it('should return null without querying when another pod holds the refresh lock', async () => {
      upgradeStatusCacheService.getComputedAt.mockResolvedValue(null);
      upgradeStatusCacheService.tryAcquireRefreshLock.mockResolvedValue(false);

      const status = await service.getInstanceAndWorkspaceCountsStatus();

      expect(status).toBeNull();
      expect(refreshSpy).not.toHaveBeenCalled();
      expect(
        upgradeStatusCacheService.releaseRefreshLock,
      ).not.toHaveBeenCalled();
    });
  });
});
