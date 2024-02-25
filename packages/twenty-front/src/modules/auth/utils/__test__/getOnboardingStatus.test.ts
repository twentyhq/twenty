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

    const ongoingWorkspaceActivation = getOnboardingStatus({
      isLoggedIn: true,
      currentWorkspaceMember: null,
      currentWorkspace: {
        id: '1',
        activationStatus: 'inactive',
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
        activationStatus: 'active',
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
        activationStatus: 'active',
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
        activationStatus: 'active',
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
        activationStatus: 'active',
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
        activationStatus: 'active',
        subscriptionStatus: 'canceled',
      } as CurrentWorkspace,
      isBillingEnabled: true,
    });

    expect(ongoingUserCreation).toBe('ongoing_user_creation');
    expect(ongoingWorkspaceActivation).toBe('ongoing_workspace_activation');
    expect(ongoingProfileCreation).toBe('ongoing_profile_creation');
    expect(completed).toBe('completed');
    expect(incomplete).toBe('incomplete');
    expect(canceled).toBe('canceled');
    expect(incompleteButBillingDisabled).toBe('completed');
  });
});
