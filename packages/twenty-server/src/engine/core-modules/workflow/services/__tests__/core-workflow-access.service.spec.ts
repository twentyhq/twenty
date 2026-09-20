import { WorkflowVisibility } from 'twenty-shared/types';

import { CoreWorkflowAccessService } from 'src/engine/core-modules/workflow/services/core-workflow-access.service';
import { WorkflowQueryValidationException } from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

const workspaceId = '20202020-0000-0000-0000-000000000001';
const ownerUserWorkspaceId = '20202020-0000-0000-0000-000000000009';
const otherUserWorkspaceId = '20202020-0000-0000-0000-00000000000a';
const coreWorkflowId = '20202020-0000-0000-0000-0000000000f1';
const coreWorkflowVersionId = '20202020-0000-0000-0000-0000000000f2';

const buildService = ({
  coreWorkflows = [],
  coreWorkflowVersions = [],
}: {
  coreWorkflows?: unknown[];
  coreWorkflowVersions?: unknown[];
} = {}) =>
  new CoreWorkflowAccessService(
    { find: jest.fn().mockResolvedValue(coreWorkflows) } as never,
    { find: jest.fn().mockResolvedValue(coreWorkflowVersions) } as never,
  );

describe('CoreWorkflowAccessService', () => {
  it('should let anyone reach a workspace workflow', async () => {
    const service = buildService({
      coreWorkflows: [
        {
          id: coreWorkflowId,
          visibility: WorkflowVisibility.WORKSPACE,
          createdByUserWorkspaceId: ownerUserWorkspaceId,
        },
      ],
    });

    await expect(
      service.assertCoreWorkflowsAreAccessibleOrThrow({
        workspaceId,
        userWorkspaceId: otherUserWorkspaceId,
        coreWorkflowIds: [coreWorkflowId],
      }),
    ).resolves.toBeUndefined();
  });

  it('should let the creator reach their own private workflow', async () => {
    const service = buildService({
      coreWorkflows: [
        {
          id: coreWorkflowId,
          visibility: WorkflowVisibility.PRIVATE,
          createdByUserWorkspaceId: ownerUserWorkspaceId,
        },
      ],
    });

    await expect(
      service.assertCoreWorkflowsAreAccessibleOrThrow({
        workspaceId,
        userWorkspaceId: ownerUserWorkspaceId,
        coreWorkflowIds: [coreWorkflowId],
      }),
    ).resolves.toBeUndefined();
  });

  it('should refuse someone else the creator kept it from', async () => {
    const service = buildService({
      coreWorkflows: [
        {
          id: coreWorkflowId,
          visibility: WorkflowVisibility.PRIVATE,
          createdByUserWorkspaceId: ownerUserWorkspaceId,
        },
      ],
    });

    await expect(
      service.assertCoreWorkflowsAreAccessibleOrThrow({
        workspaceId,
        userWorkspaceId: otherUserWorkspaceId,
        coreWorkflowIds: [coreWorkflowId],
      }),
    ).rejects.toThrow(WorkflowQueryValidationException);
  });

  it('should keep a private workflow whose creator left reachable', async () => {
    const service = buildService({
      coreWorkflows: [
        {
          id: coreWorkflowId,
          visibility: WorkflowVisibility.PRIVATE,
          createdByUserWorkspaceId: null,
        },
      ],
    });

    await expect(
      service.assertCoreWorkflowsAreAccessibleOrThrow({
        workspaceId,
        userWorkspaceId: otherUserWorkspaceId,
        coreWorkflowIds: [coreWorkflowId],
      }),
    ).resolves.toBeUndefined();
  });

  it('should leave an unknown id alone', async () => {
    const service = buildService();

    await expect(
      service.assertCoreWorkflowsAreAccessibleOrThrow({
        workspaceId,
        userWorkspaceId: otherUserWorkspaceId,
        coreWorkflowIds: [coreWorkflowId],
      }),
    ).resolves.toBeUndefined();
  });

  it('should refuse a version of someone else private workflow', async () => {
    const service = buildService({
      coreWorkflows: [
        {
          id: coreWorkflowId,
          visibility: WorkflowVisibility.PRIVATE,
          createdByUserWorkspaceId: ownerUserWorkspaceId,
        },
      ],
      coreWorkflowVersions: [{ id: coreWorkflowVersionId, coreWorkflowId }],
    });

    await expect(
      service.assertCoreWorkflowVersionsAreAccessibleOrThrow({
        workspaceId,
        userWorkspaceId: otherUserWorkspaceId,
        coreWorkflowVersionIds: [coreWorkflowVersionId],
      }),
    ).rejects.toThrow(WorkflowQueryValidationException);
  });
});
