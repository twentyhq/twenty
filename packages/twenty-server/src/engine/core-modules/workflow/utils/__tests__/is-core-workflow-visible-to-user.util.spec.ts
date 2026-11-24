import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';
import { isCoreWorkflowVisibleToUser } from 'src/engine/core-modules/workflow/utils/is-core-workflow-visible-to-user.util';

const READER_USER_WORKSPACE_ID = '20202020-0000-0000-0000-000000000001';

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
