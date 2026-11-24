import { buildCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-sql-predicate.util';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { canChangeCoreWorkflowVisibilitySelectExpression } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-select-expression.util';

const READER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('buildCoreWorkflowVisibilitySqlPredicate', () => {
  it('should read as one OR-ed fragment bound to the caller parameter', () => {
    expect(
      buildCoreWorkflowVisibilitySqlPredicate({
        tableAlias: 'c',
        userWorkspaceIdParameter: '$2',
      }),
    ).toBe(`(NOT c."isPrivate" OR c."createdByUserWorkspaceId" = $2::uuid)`);
  });
});

describe('canChangeCoreWorkflowVisibility', () => {
  it('should allow the creator and anyone when nobody owns it', () => {
    expect(
      canChangeCoreWorkflowVisibility({
        createdByUserWorkspaceId: READER_USER_WORKSPACE_ID,
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toBe(true);
    expect(
      canChangeCoreWorkflowVisibility({
        createdByUserWorkspaceId: null,
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toBe(true);
    expect(
      canChangeCoreWorkflowVisibility({
        createdByUserWorkspaceId: 'someone-else',
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toBe(false);
    expect(
      canChangeCoreWorkflowVisibility({
        createdByUserWorkspaceId: 'someone-else',
        userWorkspaceId: undefined,
      }),
    ).toBe(false);
  });
});

describe('canChangeCoreWorkflowVisibilitySelectExpression', () => {
  it('should never project NULL, which the predicate does for an API key', () => {
    expect(
      canChangeCoreWorkflowVisibilitySelectExpression({
        tableAlias: 'c',
        userWorkspaceIdParameter: '$2',
      }),
    ).toBe(
      `coalesce((c."createdByUserWorkspaceId" IS NULL OR c."createdByUserWorkspaceId" = $2::uuid), false)`,
    );
  });
});
