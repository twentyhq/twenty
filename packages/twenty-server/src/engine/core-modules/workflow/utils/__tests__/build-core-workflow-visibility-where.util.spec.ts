import { WorkflowVisibility } from 'twenty-shared/types';

import {
  buildCoreWorkflowVisibilitySqlPredicate,
  buildCoreWorkflowVisibilityWhere,
} from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-where.util';

const READER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('buildCoreWorkflowVisibilityWhere', () => {
  it('should let a reader see workspace workflows and their own', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toEqual([
      { visibility: WorkflowVisibility.WORKSPACE },
      { createdByUserWorkspaceId: READER_USER_WORKSPACE_ID },
    ]);
  });

  it('should repeat the other conditions in both clauses', () => {
    const where = buildCoreWorkflowVisibilityWhere({
      userWorkspaceId: READER_USER_WORKSPACE_ID,
      applicationId: 'an-application-id',
    });

    expect(where).toHaveLength(2);
    expect(where[0]).toMatchObject({ applicationId: 'an-application-id' });
    expect(where[1]).toMatchObject({ applicationId: 'an-application-id' });
  });
});

describe('buildCoreWorkflowVisibilitySqlPredicate', () => {
  it('should read as one OR-ed fragment bound to the caller parameter', () => {
    expect(
      buildCoreWorkflowVisibilitySqlPredicate({
        tableAlias: 'c',
        userWorkspaceIdParameter: '$2',
      }),
    ).toBe(
      `(c."visibility" = 'WORKSPACE' OR c."createdByUserWorkspaceId" = $2::uuid)`,
    );
  });
});
