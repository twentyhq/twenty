import { canChangeCoreWorkflowVisibility } from 'src/engine/core-modules/workflow/utils/can-change-core-workflow-visibility.util';

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
