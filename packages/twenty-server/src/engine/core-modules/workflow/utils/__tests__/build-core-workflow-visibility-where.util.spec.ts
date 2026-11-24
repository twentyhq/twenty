import { buildCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-sql-predicate.util';
import { buildCoreWorkflowVisibilityWhere } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-where.util';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { canChangeCoreWorkflowVisibilitySelectExpression } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-select-expression.util';

const READER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('buildCoreWorkflowVisibilityWhere', () => {
  it('should let a member see workspace workflows and their own', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({
        callerScope: {
          type: 'sharedAndOwned',
          userWorkspaceId: READER_USER_WORKSPACE_ID,
        },
      }),
    ).toEqual([
      { isPrivate: false },
      { createdByUserWorkspaceId: READER_USER_WORKSPACE_ID },
    ]);
  });

  it('should keep an API key out of everyone private workflows', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({ callerScope: { type: 'shared' } }),
    ).toEqual([{ isPrivate: false }]);
  });

  it('should let the system see every workflow', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({
        callerScope: { type: 'all' },
        applicationId: 'an-application-id',
      }),
    ).toEqual([{ applicationId: 'an-application-id' }]);
  });

  it('should only show workspace workflows when no caller is set', () => {
    expect(buildCoreWorkflowVisibilityWhere({})).toEqual([
      { isPrivate: false },
    ]);
  });

  it('should repeat the other conditions in both clauses', () => {
    const where = buildCoreWorkflowVisibilityWhere({
      callerScope: {
        type: 'sharedAndOwned',
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      },
      applicationId: 'an-application-id',
    });

    expect(where).toHaveLength(2);

    for (const clause of where) {
      expect(clause).toMatchObject({ applicationId: 'an-application-id' });
    }
  });
});

describe('buildCoreWorkflowVisibilitySqlPredicate', () => {
  it('should read as one OR-ed fragment bound to the caller parameter', () => {
    expect(
      buildCoreWorkflowVisibilitySqlPredicate({
        tableAlias: 'c',
        userWorkspaceIdParameter: '$2',
        callerScope: {
          type: 'sharedAndOwned',
          userWorkspaceId: READER_USER_WORKSPACE_ID,
        },
      }),
    ).toBe(
      `(NOT c."isPrivate" OR c."createdByUserWorkspaceId" = $2::uuid OR FALSE)`,
    );
  });

  it('should match every row for the system', () => {
    expect(
      buildCoreWorkflowVisibilitySqlPredicate({
        tableAlias: 'c',
        userWorkspaceIdParameter: '$2',
        callerScope: { type: 'all' },
      }),
    ).toBe(
      `(NOT c."isPrivate" OR c."createdByUserWorkspaceId" = $2::uuid OR TRUE)`,
    );
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
