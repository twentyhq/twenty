import { WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE } from 'src/engine/core-modules/workflow/utils/workflow-run-of-shared-workflow-sharing-rule.util';

describe('WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE', () => {
  it('keeps out runs whose core workflow is private to its creator', () => {
    expect(
      WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE.buildCondition('workflowRun')
        .sql,
    ).toBe(
      `NOT EXISTS (SELECT 1 FROM core."workflow" AS "workflowRun_coreWorkflow" WHERE "workflowRun_coreWorkflow"."id" = "workflowRun"."coreWorkflowId" AND "workflowRun_coreWorkflow"."visibility" <> 'WORKSPACE' AND "workflowRun_coreWorkflow"."createdByUserWorkspaceId" IS NOT NULL)`,
    );
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
          executeRawQuery,
        },
      ),
    ).toEqual(new Set(['run-of-shared', 'run-without-workflow']));
    expect(executeRawQuery).toHaveBeenCalledWith(
      `SELECT "id" FROM core."workflow" AS "coreWorkflow" WHERE "coreWorkflow"."id" = ANY(:coreWorkflowIds) AND "coreWorkflow"."visibility" <> 'WORKSPACE' AND "coreWorkflow"."createdByUserWorkspaceId" IS NOT NULL`,
      { coreWorkflowIds: ['private-workflow', 'shared-workflow'] },
    );
  });

  it('skips the lookup when no run has a core workflow', async () => {
    const executeRawQuery = jest.fn();

    expect(
      await WORKFLOW_RUN_OF_SHARED_WORKFLOW_SHARING_RULE.resolveMatchingRecordIds(
        {
          records: [{ id: 'run-without-workflow', coreWorkflowId: null }],
          executeRawQuery,
        },
      ),
    ).toEqual(new Set(['run-without-workflow']));
    expect(executeRawQuery).not.toHaveBeenCalled();
  });
});
