import { WorkflowVisibility } from 'twenty-shared/types';
import { IsNull } from 'typeorm';

import { WorkflowQueryValidationException } from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

import { assertPrivateCoreWorkflowHasOwner } from 'src/engine/core-modules/workflow/utils/assert-private-core-workflow-has-owner.util';
import { buildCoreWorkflowVisibilitySqlPredicate } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-sql-predicate.util';
import { buildCoreWorkflowVisibilityWhere } from 'src/engine/core-modules/workflow/utils/build-core-workflow-visibility-where.util';
import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { canChangeCoreWorkflowVisibilitySelectExpression } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility-select-expression.util';

const READER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

describe('buildCoreWorkflowVisibilityWhere', () => {
  it('should let a reader see workspace workflows, their own and ownerless ones', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).toEqual([
      { visibility: WorkflowVisibility.WORKSPACE },
      { createdByUserWorkspaceId: IsNull() },
      { createdByUserWorkspaceId: READER_USER_WORKSPACE_ID },
    ]);
  });

  it('should keep an API key out of everyone private workflows', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({ userWorkspaceId: undefined }),
    ).toEqual([
      { visibility: WorkflowVisibility.WORKSPACE },
      { createdByUserWorkspaceId: IsNull() },
    ]);
  });

  it('should repeat the other conditions in both clauses', () => {
    const where = buildCoreWorkflowVisibilityWhere({
      userWorkspaceId: READER_USER_WORKSPACE_ID,
      applicationId: 'an-application-id',
    });

    expect(where).toHaveLength(3);

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
    ).toBe(
      `(c."visibility" = 'WORKSPACE' OR (c."createdByUserWorkspaceId" IS NULL OR c."createdByUserWorkspaceId" = $2::uuid))`,
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

describe('assertPrivateCoreWorkflowHasOwner', () => {
  it('should refuse a private workflow when no user workspace can own it', () => {
    expect(() =>
      assertPrivateCoreWorkflowHasOwner({
        visibility: WorkflowVisibility.PRIVATE,
        userWorkspaceId: undefined,
      }),
    ).toThrow(WorkflowQueryValidationException);
  });

  it('should allow a private workflow created by a member', () => {
    expect(() =>
      assertPrivateCoreWorkflowHasOwner({
        visibility: WorkflowVisibility.PRIVATE,
        userWorkspaceId: READER_USER_WORKSPACE_ID,
      }),
    ).not.toThrow();
  });

  it('should leave workspace and unspecified visibility to an application', () => {
    expect(() =>
      assertPrivateCoreWorkflowHasOwner({
        visibility: WorkflowVisibility.WORKSPACE,
        userWorkspaceId: undefined,
      }),
    ).not.toThrow();
    expect(() =>
      assertPrivateCoreWorkflowHasOwner({
        visibility: undefined,
        userWorkspaceId: undefined,
      }),
    ).not.toThrow();
  });

  // The refusal exists because a null owner is not neutral: it is read as
  // workspace-wide by the visibility filter, so storing one would publish the
  // workflow it was asked to keep private.
  it('should match the ownerless clause that makes such a row readable', () => {
    expect(
      buildCoreWorkflowVisibilityWhere({ userWorkspaceId: undefined }),
    ).toContainEqual({ createdByUserWorkspaceId: IsNull() });
  });
});
