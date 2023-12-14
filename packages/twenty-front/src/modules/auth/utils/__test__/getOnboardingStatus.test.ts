import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { getOnboardingStatus } from '../getOnboardingStatus';

describe('getOnboardingStatus', () => {
  it('should return the correct status', () => {
    const ongoingUserCreation = getOnboardingStatus(false, null, null);
    const unknownStatus = getOnboardingStatus(true, null, null);
    const ongoingWorkspaceCreation = getOnboardingStatus(
      true,
      {
        id: '1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as WorkspaceMember,
      {
        id: '1',
        displayName: null,
      } as CurrentWorkspace,
    );
    const ongoingProfileCreation = getOnboardingStatus(
      true,
      {
        id: '1',
        locale: 'en',
        name: {},
      } as WorkspaceMember,
      {
        id: '1',
        displayName: 'My Workspace',
      } as CurrentWorkspace,
    );
    const completed = getOnboardingStatus(
      true,
      {
        id: '1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
        locale: 'en',
      } as WorkspaceMember,
      {
        id: '1',
        displayName: 'My Workspace',
      } as CurrentWorkspace,
    );

    expect(ongoingUserCreation).toBe('ongoing_user_creation');
    expect(unknownStatus).toBe(undefined);
    expect(ongoingWorkspaceCreation).toBe('ongoing_workspace_creation');
    expect(ongoingProfileCreation).toBe('ongoing_profile_creation');
    expect(completed).toBe('completed');
  });
});
