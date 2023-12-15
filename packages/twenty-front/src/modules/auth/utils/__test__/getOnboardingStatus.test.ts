import { CurrentWorkspace } from '@/auth/states/currentWorkspaceState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

import { getOnboardingStatus } from '../getOnboardingStatus';

describe('getOnboardingStatus', () => {
  it('should return the correct status', () => {
    const ongoingUserCreation = getOnboardingStatus({
      isLoggedIn: false,
      currentWorkspaceMember: null,
      currentWorkspace: null,
    });

    const unknownStatus = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: null,
      currentWorkspace: null,
    });

    const ongoingWorkspaceCreation = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: {
        id: '1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as WorkspaceMember,
      currentWorkspace: {
        id: '1',
        displayName: null,
      } as CurrentWorkspace,
    });

    const ongoingProfileCreation = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: {
        id: '1',
        name: {},
      } as WorkspaceMember,
      currentWorkspace: {
        id: '1',
        displayName: 'My Workspace',
      } as CurrentWorkspace,
    });

    const completed = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: {
        id: '1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as WorkspaceMember,
      currentWorkspace: {
        id: '1',
        displayName: 'My Workspace',
      } as CurrentWorkspace,
    });

    const incomplete = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: {
        id: '1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as WorkspaceMember,
      currentWorkspace: {
        id: '1',
        displayName: 'My Workspace',
        subscriptionStatus: 'incomplete',
      } as CurrentWorkspace,
      isBillingEnabled: true,
    });

    const incompleteButBillingDisabled = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: {
        id: '1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as WorkspaceMember,
      currentWorkspace: {
        id: '1',
        displayName: 'My Workspace',
        subscriptionStatus: 'incomplete',
      } as CurrentWorkspace,
    });

    const canceled = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: {
        id: '1',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as WorkspaceMember,
      currentWorkspace: {
        id: '1',
        displayName: 'My Workspace',
        subscriptionStatus: 'canceled',
      } as CurrentWorkspace,
      isBillingEnabled: true,
    });

    expect(ongoingUserCreation).toBe('ongoing_user_creation');
    expect(unknownStatus).toBe(undefined);
    expect(ongoingWorkspaceCreation).toBe('ongoing_workspace_creation');
    expect(ongoingProfileCreation).toBe('ongoing_profile_creation');
    expect(completed).toBe('completed');
    expect(incomplete).toBe('incomplete');
    expect(canceled).toBe('canceled');
    expect(incompleteButBillingDisabled).toBe('completed');
  });
});
