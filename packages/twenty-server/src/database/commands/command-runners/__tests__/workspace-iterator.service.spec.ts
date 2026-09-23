import { Logger } from '@nestjs/common';

import { type DataSource, type Repository } from 'typeorm';

import { type CommandShutdownService } from 'src/database/commands/command-runners/command-shutdown.service';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';

describe('WorkspaceIteratorService', () => {
  let workspaceCacheService: jest.Mocked<
    Pick<WorkspaceCacheService, 'evictWorkspaceFromLocalCache'>
  >;
  let service: WorkspaceIteratorService;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const workspaceRepository = {
      findOne: jest
        .fn()
        .mockResolvedValue({ databaseSchema: 'workspace_schema' }),
    } as unknown as Repository<WorkspaceEntity>;
    const workspaceOrmManager = {
      executeInWorkspaceContext: jest.fn((fn: () => Promise<void>) => fn()),
    } as unknown as WorkspaceOrmManager;
    const commandShutdownService = {
      isShutdownRequested: jest.fn().mockReturnValue(false),
      listenToShutdownSignals: jest.fn(),
    } as unknown as CommandShutdownService;

    workspaceCacheService = {
      evictWorkspaceFromLocalCache: jest.fn().mockResolvedValue(undefined),
    };

    service = new WorkspaceIteratorService(
      workspaceRepository,
      {} as DataSource,
      workspaceOrmManager,
      commandShutdownService,
      workspaceCacheService as unknown as WorkspaceCacheService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('evicts each workspace from the local cache once its callback has run', async () => {
    const events: string[] = [];

    workspaceCacheService.evictWorkspaceFromLocalCache.mockImplementation(
      async (workspaceId) => {
        events.push(`evict:${workspaceId}`);
      },
    );

    const report = await service.iterate({
      workspaceIds: ['workspace-1', 'workspace-2'],
      callback: async ({ workspaceId }) => {
        events.push(`callback:${workspaceId}`);
      },
    });

    expect(report.success.map(({ workspaceId }) => workspaceId)).toEqual([
      'workspace-1',
      'workspace-2',
    ]);
    expect(events).toEqual([
      'callback:workspace-1',
      'evict:workspace-1',
      'callback:workspace-2',
      'evict:workspace-2',
    ]);
  });

  it('still evicts a workspace whose callback failed', async () => {
    const report = await service.iterate({
      workspaceIds: ['workspace-1'],
      callback: async () => {
        throw new Error('callback failed');
      },
    });

    expect(report.fail).toEqual([
      { workspaceId: 'workspace-1', error: new Error('callback failed') },
    ]);
    expect(
      workspaceCacheService.evictWorkspaceFromLocalCache,
    ).toHaveBeenCalledTimes(1);
    expect(
      workspaceCacheService.evictWorkspaceFromLocalCache,
    ).toHaveBeenCalledWith('workspace-1');
  });

  it('logs the rejected metadata and validation reason when a migration cannot be built', async () => {
    const error = new WorkspaceMigrationBuilderException(
      {
        status: 'fail',
        report: {
          ...EMPTY_ORCHESTRATOR_FAILURE_REPORT(),
          viewField: [
            {
              metadataName: 'viewField',
              type: 'create',
              flatEntityMinimalInformation: {
                universalIdentifier: 'missing-field-view',
                fieldMetadataUniversalIdentifier: 'missing-field',
              },
              errors: [
                {
                  code: ViewExceptionCode.INVALID_VIEW_DATA,
                  message: 'Field metadata not found',
                },
              ],
            },
          ],
        },
      },
      'Failed to sync the message record page',
    );

    const report = await service.iterate({
      workspaceIds: ['workspace-1', 'workspace-2'],
      callback: async ({ workspaceId }) => {
        if (workspaceId === 'workspace-1') {
          throw error;
        }
      },
    });

    expect(report.fail).toEqual([{ workspaceId: 'workspace-1', error }]);
    expect(report.success).toEqual([{ workspaceId: 'workspace-2' }]);
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining('Field metadata not found'),
    );
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining('missing-field'),
    );
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      expect.stringContaining('workspace-1'),
    );
  });
});
