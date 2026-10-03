import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { WorkflowRunRecordShareService } from 'src/engine/core-modules/workflow/services/workflow-run-record-share.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { getWorkspaceScopedRepositoryToken } from 'src/engine/twenty-orm/workspace-scoped-repository/get-workspace-scoped-repository-token.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const CORE_WORKFLOW_IDS = ['core-workflow-id'];

const DELETE_INPUT = {
  workspaceId: WORKSPACE_ID,
  userWorkspaceId: USER_WORKSPACE_ID,
};

describe('UserWorkspaceService.deleteUserWorkspace', () => {
  let service: UserWorkspaceService;
  const userWorkspaceRepository = {
    delete: jest.fn(),
    softDelete: jest.fn(),
  };
  const roleTargetRepository = { delete: jest.fn() };
  const workspaceCacheService = { invalidateAndRecompute: jest.fn() };
  const workflowRunRecordShareService = {
    findCoreWorkflowIdsCreatedBy: jest.fn(),
    syncRunsOfCoreWorkflows: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    workflowRunRecordShareService.findCoreWorkflowIdsCreatedBy.mockResolvedValue(
      CORE_WORKFLOW_IDS,
    );

    const module = await Test.createTestingModule({
      providers: [
        UserWorkspaceService,
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        {
          provide: getWorkspaceScopedRepositoryToken(RoleTargetEntity),
          useValue: roleTargetRepository,
        },
        {
          provide: WorkspaceCacheService,
          useValue: workspaceCacheService,
        },
        {
          provide: WorkflowRunRecordShareService,
          useValue: workflowRunRecordShareService,
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get(UserWorkspaceService);
  });

  it('refreshes the member role caches after both hard deletes and before sharing sync', async () => {
    roleTargetRepository.delete.mockImplementation(async () => {
      expect(userWorkspaceRepository.delete).not.toHaveBeenCalled();
      expect(
        workspaceCacheService.invalidateAndRecompute,
      ).not.toHaveBeenCalled();
    });
    userWorkspaceRepository.delete.mockImplementation(async () => {
      expect(roleTargetRepository.delete).toHaveBeenCalledWith(WORKSPACE_ID, {
        userWorkspaceId: USER_WORKSPACE_ID,
      });
      expect(
        workspaceCacheService.invalidateAndRecompute,
      ).not.toHaveBeenCalled();
    });
    workspaceCacheService.invalidateAndRecompute.mockImplementation(
      async () => {
        expect(userWorkspaceRepository.delete).toHaveBeenCalledWith({
          id: USER_WORKSPACE_ID,
        });
        expect(
          workflowRunRecordShareService.syncRunsOfCoreWorkflows,
        ).not.toHaveBeenCalled();
      },
    );
    workflowRunRecordShareService.syncRunsOfCoreWorkflows.mockImplementation(
      async () => {
        expect(
          workspaceCacheService.invalidateAndRecompute,
        ).toHaveBeenCalledWith(WORKSPACE_ID, [
          'flatRoleTargetMaps',
          'flatRoleMaps',
          'userWorkspaceRoleMap',
        ]);
      },
    );

    await service.deleteUserWorkspace(DELETE_INPUT);

    expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledTimes(
      1,
    );
    expect(
      workflowRunRecordShareService.syncRunsOfCoreWorkflows,
    ).toHaveBeenCalledWith({
      workspaceId: WORKSPACE_ID,
      coreWorkflowIds: CORE_WORKFLOW_IDS,
    });
    expect(userWorkspaceRepository.softDelete).not.toHaveBeenCalled();
  });

  it('awaits the cache refresh before syncing workflow shares and returning', async () => {
    let completeRefresh: () => void = () => {
      throw new Error('Cache refresh has not started');
    };
    let notifyRefreshStarted: () => void;
    const refreshStarted = new Promise<void>((resolve) => {
      notifyRefreshStarted = resolve;
    });
    workspaceCacheService.invalidateAndRecompute.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          completeRefresh = resolve;
          notifyRefreshStarted();
        }),
    );

    let deletionFinished = false;
    const deletion = service.deleteUserWorkspace(DELETE_INPUT).then(() => {
      deletionFinished = true;
    });

    await Promise.race([refreshStarted, deletion]);
    expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledTimes(
      1,
    );
    expect(deletionFinished).toBe(false);
    expect(
      workflowRunRecordShareService.syncRunsOfCoreWorkflows,
    ).not.toHaveBeenCalled();

    completeRefresh();
    await deletion;
    expect(
      workflowRunRecordShareService.syncRunsOfCoreWorkflows,
    ).toHaveBeenCalledTimes(1);
  });

  it('preserves role targets and does not refresh role caches for a soft delete', async () => {
    await service.deleteUserWorkspace({ ...DELETE_INPUT, softDelete: true });

    expect(userWorkspaceRepository.softDelete).toHaveBeenCalledWith({
      id: USER_WORKSPACE_ID,
    });
    expect(roleTargetRepository.delete).not.toHaveBeenCalled();
    expect(userWorkspaceRepository.delete).not.toHaveBeenCalled();
    expect(workspaceCacheService.invalidateAndRecompute).not.toHaveBeenCalled();
    expect(
      workflowRunRecordShareService.findCoreWorkflowIdsCreatedBy,
    ).not.toHaveBeenCalled();
    expect(
      workflowRunRecordShareService.syncRunsOfCoreWorkflows,
    ).not.toHaveBeenCalled();
  });

  it.each(['roleTarget', 'userWorkspace'] as const)(
    'does not refresh role caches if the %s delete fails',
    async (failingDelete) => {
      const error = new Error('Delete failed');
      const repository =
        failingDelete === 'roleTarget'
          ? roleTargetRepository
          : userWorkspaceRepository;

      repository.delete.mockRejectedValue(error);

      await expect(service.deleteUserWorkspace(DELETE_INPUT)).rejects.toBe(
        error,
      );

      expect(
        workspaceCacheService.invalidateAndRecompute,
      ).not.toHaveBeenCalled();
      expect(
        workflowRunRecordShareService.syncRunsOfCoreWorkflows,
      ).not.toHaveBeenCalled();
      if (failingDelete === 'roleTarget') {
        expect(userWorkspaceRepository.delete).not.toHaveBeenCalled();
      }
    },
  );

  it('propagates cache refresh errors without syncing workflow shares', async () => {
    const error = new Error('Cache refresh failed');

    workspaceCacheService.invalidateAndRecompute.mockRejectedValue(error);

    await expect(service.deleteUserWorkspace(DELETE_INPUT)).rejects.toBe(error);

    expect(userWorkspaceRepository.delete).toHaveBeenCalledWith({
      id: USER_WORKSPACE_ID,
    });
    expect(
      workflowRunRecordShareService.syncRunsOfCoreWorkflows,
    ).not.toHaveBeenCalled();
  });
});
