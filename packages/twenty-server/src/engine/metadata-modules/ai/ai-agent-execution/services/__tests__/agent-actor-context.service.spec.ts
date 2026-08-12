import { Test, type TestingModule } from '@nestjs/testing';

import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { AgentActorContextService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-actor-context.service';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

describe('AgentActorContextService', () => {
  let service: AgentActorContextService;
  let userWorkspaceService: {
    getWorkspaceMember: jest.Mock;
    getUserWorkspaceForUser: jest.Mock;
  };
  let userRoleService: { getRoleIdForUserWorkspace: jest.Mock };

  const workspaceId = 'workspace-1';
  const workspaceMemberId = 'workspace-member-1';

  const runAsArgs = { workspaceMemberId, workspaceId };

  beforeEach(async () => {
    userWorkspaceService = {
      getWorkspaceMember: jest.fn().mockResolvedValue({
        id: workspaceMemberId,
        userId: 'user-1',
        name: { firstName: 'Ada', lastName: 'Lovelace' },
      }),
      getUserWorkspaceForUser: jest.fn().mockResolvedValue({
        id: 'user-workspace-1',
        userId: 'user-1',
        workspace: {
          id: workspaceId,
          createdAt: new Date(0),
          updatedAt: new Date(0),
        },
        user: {
          id: 'user-1',
          createdAt: new Date(0),
          updatedAt: new Date(0),
        },
      }),
    };
    userRoleService = {
      getRoleIdForUserWorkspace: jest.fn().mockResolvedValue('role-1'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentActorContextService,
        { provide: UserWorkspaceService, useValue: userWorkspaceService },
        { provide: UserRoleService, useValue: userRoleService },
        { provide: GlobalWorkspaceOrmManager, useValue: {} },
      ],
    }).compile();

    service = module.get(AgentActorContextService);
  });

  it('reports a not-found error when the workspace member does not exist', async () => {
    userWorkspaceService.getWorkspaceMember.mockResolvedValue(null);

    await expect(
      service.buildRunAsWorkspaceMemberContext(runAsArgs),
    ).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
    });
  });

  it('reports a not-found error when the member has no user workspace', async () => {
    userWorkspaceService.getUserWorkspaceForUser.mockResolvedValue(null);

    await expect(
      service.buildRunAsWorkspaceMemberContext(runAsArgs),
    ).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
    });
  });

  it('reports a not-found error when the member has no role assigned', async () => {
    userRoleService.getRoleIdForUserWorkspace.mockRejectedValue(
      new PermissionsException(
        'No role found for userWorkspace',
        PermissionsExceptionCode.NO_ROLE_FOUND_FOR_USER_WORKSPACE,
      ),
    );

    await expect(
      service.buildRunAsWorkspaceMemberContext(runAsArgs),
    ).rejects.toMatchObject({
      code: AiExceptionCode.RUN_AS_WORKSPACE_MEMBER_NOT_FOUND,
    });
  });

  it('lets an infrastructure failure keep its own error type', async () => {
    const databaseError = new Error('connection terminated unexpectedly');

    userWorkspaceService.getWorkspaceMember.mockRejectedValue(databaseError);

    await expect(
      service.buildRunAsWorkspaceMemberContext(runAsArgs),
    ).rejects.toBe(databaseError);
  });

  it('lets an unrelated permissions failure keep its own error type', async () => {
    const permissionsError = new PermissionsException(
      'Permission denied',
      PermissionsExceptionCode.PERMISSION_DENIED,
    );

    userRoleService.getRoleIdForUserWorkspace.mockRejectedValue(
      permissionsError,
    );

    await expect(
      service.buildRunAsWorkspaceMemberContext(runAsArgs),
    ).rejects.toBe(permissionsError);
  });

  it('returns the member actor context, auth context and role', async () => {
    const result = await service.buildRunAsWorkspaceMemberContext(runAsArgs);

    expect(result.roleId).toBe('role-1');
    expect(result.authContext).toMatchObject({
      type: 'user',
      workspaceMemberId,
    });
  });

  it('keeps the acting application on the context as provenance, never as a permission input', async () => {
    const viaApplication = {
      id: 'app-1',
      defaultRoleId: 'app-role-1',
    } as unknown as Parameters<
      typeof service.buildRunAsWorkspaceMemberContext
    >[0]['viaApplication'];

    const result = await service.buildRunAsWorkspaceMemberContext({
      ...runAsArgs,
      viaApplication,
    });

    expect(result.authContext.viaApplication).toBe(viaApplication);
    // the application field would intersect the member's permissions with the
    // application default role, so run-as must never populate it
    expect(result.authContext.application).toBeUndefined();
  });

  it('leaves the provenance field absent when no application is given', async () => {
    const result = await service.buildRunAsWorkspaceMemberContext(runAsArgs);

    expect('viaApplication' in result.authContext).toBe(false);
  });
});
