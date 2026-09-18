import { FieldActorSource } from 'twenty-shared/types';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { CoreWorkflowActorWorkspaceService } from 'src/engine/core-modules/workflow/services/core-workflow-actor.workspace-service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkflowQueryValidationException } from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

const WORKSPACE_ID = 'workspace-id';
const USER_ID = 'user-id';
const WORKSPACE_MEMBER_ID = 'workspace-member-id';

const buildService = (workspaceMember: unknown) => {
  const workspaceOrmManager = {
    executeInWorkspaceContext: jest.fn(async (callback: () => unknown) =>
      callback(),
    ),
    getRepository: jest.fn().mockReturnValue({
      findOne: jest.fn().mockResolvedValue(workspaceMember),
    }),
  } as unknown as WorkspaceOrmManager;

  return new CoreWorkflowActorWorkspaceService(workspaceOrmManager);
};

const APPLICATION = { id: 'application-id', name: 'PDL' } as FlatApplication;

describe('CoreWorkflowActorWorkspaceService', () => {
  it('should attribute to the workspace member when a user is authenticated', async () => {
    const service = buildService({
      id: WORKSPACE_MEMBER_ID,
      name: { firstName: 'Jane', lastName: 'Doe' },
    });

    await expect(
      service.resolveActorOrThrow({
        workspaceId: WORKSPACE_ID,
        userId: USER_ID,
      }),
    ).resolves.toMatchObject({
      source: FieldActorSource.MANUAL,
      workspaceMemberId: WORKSPACE_MEMBER_ID,
      name: 'Jane Doe',
    });
  });

  it('should attribute to the application when nothing human is authenticated', async () => {
    const service = buildService(null);

    await expect(
      service.resolveActorOrThrow({
        workspaceId: WORKSPACE_ID,
        application: APPLICATION,
      }),
    ).resolves.toMatchObject({
      source: FieldActorSource.APPLICATION,
      workspaceMemberId: null,
      name: 'PDL',
    });
  });

  it('should prefer the application over a user that has no workspace member', async () => {
    const service = buildService(null);

    await expect(
      service.resolveActorOrThrow({
        workspaceId: WORKSPACE_ID,
        userId: USER_ID,
        application: APPLICATION,
      }),
    ).resolves.toMatchObject({
      source: FieldActorSource.APPLICATION,
      workspaceMemberId: null,
    });
  });

  it('should refuse to invent an actor when nothing is authenticated', async () => {
    const service = buildService(null);

    await expect(
      service.resolveActorOrThrow({ workspaceId: WORKSPACE_ID }),
    ).rejects.toBeInstanceOf(WorkflowQueryValidationException);
  });
});
