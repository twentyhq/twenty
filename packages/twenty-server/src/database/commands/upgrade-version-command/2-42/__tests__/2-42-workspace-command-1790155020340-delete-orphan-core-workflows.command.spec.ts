import { Test } from '@nestjs/testing';

import { type DataSource } from 'typeorm';

import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { DeleteOrphanCoreWorkflowsCommand } from 'src/database/commands/upgrade-version-command/2-42/2-42-workspace-command-1790155020340-delete-orphan-core-workflows.command';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';
const ORPHAN_CORE_WORKFLOW_ID = '20202020-0000-0000-0000-000000000010';

describe('DeleteOrphanCoreWorkflowsCommand', () => {
  let command: DeleteOrphanCoreWorkflowsCommand;
  let deleteFromCoreMock: jest.Mock;

  beforeEach(async () => {
    deleteFromCoreMock = jest.fn().mockResolvedValue(undefined);

    const module = await Test.createTestingModule({
      providers: [
        DeleteOrphanCoreWorkflowsCommand,
        { provide: WorkspaceIteratorService, useValue: {} },
        {
          provide: WorkspaceCacheService,
          useValue: { invalidateAndRecompute: jest.fn() },
        },
        {
          provide: WorkflowCoreSyncService,
          useValue: { deleteFromCore: deleteFromCoreMock },
        },
      ],
    }).compile();

    command = module.get(DeleteOrphanCoreWorkflowsCommand);

    jest.spyOn(command['logger'], 'log').mockImplementation();
  });

  it('deletes orphan core workflows without persisting deferred operations', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce([{ '?column?': 1 }])
      .mockResolvedValueOnce([{ '?column?': 1 }])
      .mockResolvedValueOnce([{ id: ORPHAN_CORE_WORKFLOW_ID }]);

    const dataSource = {
      createQueryRunner: () => ({
        connect: jest.fn(),
        release: jest.fn(),
        query,
      }),
    } as unknown as DataSource;

    await command.runOnWorkspace({
      workspaceId: WORKSPACE_ID,
      options: { dryRun: false },
      index: 0,
      total: 1,
      dataSource,
    });

    expect(deleteFromCoreMock).toHaveBeenCalledWith(
      WORKSPACE_ID,
      [ORPHAN_CORE_WORKFLOW_ID],
      { shouldDeferActions: false },
    );
  });
});
