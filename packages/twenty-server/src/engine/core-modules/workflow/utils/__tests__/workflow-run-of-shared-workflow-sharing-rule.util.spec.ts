import { WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE } from 'src/engine/core-modules/workflow/utils/workflow-run-of-shared-workflow-sharing-rule.util';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';

describe('WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE', () => {
  it('keeps out runs whose core workflow is private to its creator, within the workspace', () => {
    expect(
      WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE.buildCondition({
        tableAlias: 'workflowRun',
        workspaceId: WORKSPACE_ID,
      }),
    ).toEqual({
      sql: `NOT EXISTS (SELECT 1 FROM core."workflow" AS "workflowRun_coreWorkflow" WHERE "workflowRun_coreWorkflow"."id" = "workflowRun"."coreWorkflowId" AND "workflowRun_coreWorkflow"."workspaceId" = :sharingRuleWorkspaceId AND "workflowRun_coreWorkflow"."visibility" <> 'WORKSPACE' AND "workflowRun_coreWorkflow"."createdByUserWorkspaceId" IS NOT NULL)`,
      parameters: { sharingRuleWorkspaceId: WORKSPACE_ID },
    });
  });

  it('admits in memory every run but those of a private workflow', async () => {
    const executeRawQuery = jest.fn(async () => [{ id: 'private-workflow' }]);

    expect(
      await WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE.resolveMatchingRecordIds(
        {
          records: [
            { id: 'run-of-private', coreWorkflowId: 'private-workflow' },
            { id: 'run-of-shared', coreWorkflowId: 'shared-workflow' },
            { id: 'run-without-workflow', coreWorkflowId: null },
          ],
          workspaceId: WORKSPACE_ID,
          executeRawQuery,
        },
      ),
    ).toEqual(new Set(['run-of-shared', 'run-without-workflow']));
    expect(executeRawQuery).toHaveBeenCalledWith(
      `SELECT "id" FROM core."workflow" AS "coreWorkflow" WHERE "coreWorkflow"."id" = ANY(:coreWorkflowIds) AND "coreWorkflow"."workspaceId" = :workspaceId AND "coreWorkflow"."visibility" <> 'WORKSPACE' AND "coreWorkflow"."createdByUserWorkspaceId" IS NOT NULL`,
      {
        coreWorkflowIds: ['private-workflow', 'shared-workflow'],
        workspaceId: WORKSPACE_ID,
      },
    );
  });

  it('skips the lookup when no run has a core workflow', async () => {
    const executeRawQuery = jest.fn();

    expect(
      await WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE.resolveMatchingRecordIds(
        {
          records: [{ id: 'run-without-workflow', coreWorkflowId: null }],
          workspaceId: WORKSPACE_ID,
          executeRawQuery,
        },
      ),
    ).toEqual(new Set(['run-without-workflow']));
    expect(executeRawQuery).not.toHaveBeenCalled();
  });
});
