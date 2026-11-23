import { buildCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-sql-predicate.util';
import { buildCoreWorkflowVisibilityWhere } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-where.util';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { canChangeCoreWorkflowVisibilitySelectExpression } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-select-expression.util';
import { isCoreWorkflowVisibleToUser } from 'src/engine/core-modules/workflow/utils/is-core-workflow-visible-to-user.util';

const READER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('buildCoreWorkflowVisibilityWhere', () => {
  it('should let a reader see workspace workflows and their own', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toEqual([
      { isPrivate: false },
      { createdByUserWorkspaceId: READER_USER_WORKSPACE_ID },
    ]);
  });

  it('should keep an API key out of everyone private workflows', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({ userWorkspaceId: undefined }),
    ).toEqual([{ isPrivate: false }]);
  });

  it('should repeat the other conditions in both clauses', () => {
    const where = buildCoreWorkflowVisibilityWhere({
      userWorkspaceId: READER_USER_WORKSPACE_ID,
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

describe('isCoreWorkflowVisibleToUser', () => {
  it('should show workspace workflows to everyone and private ones to their creator only', () => {
    expect(
      isCoreWorkflowVisibleToUser({
        isPrivate: false,
        createdByUserWorkspaceId: null,
        userWorkspaceId: undefined,
      }),
    ).toBe(true);
    expect(
      isCoreWorkflowVisibleToUser({
        isPrivate: true,
        createdByUserWorkspaceId: READER_USER_WORKSPACE_ID,
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toBe(true);
    expect(
      isCoreWorkflowVisibleToUser({
        isPrivate: true,
        createdByUserWorkspaceId: 'someone-else',
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });

  it('should hide a private workflow with no creator from everyone', () => {
    expect(
      isCoreWorkflowVisibleToUser({
        isPrivate: true,
        createdByUserWorkspaceId: null,
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toBe(false);
  });
});
