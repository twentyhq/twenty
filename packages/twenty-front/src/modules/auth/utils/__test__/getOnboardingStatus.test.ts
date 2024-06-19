import { CurrentUser } from '@/auth/states/currentUserState';
import { OnboardingStep } from '~/generated/graphql';

import { getOnboardingStatus } from '../getOnboardingStatus';

describe('getOnboardingStatus', () => {
  it('should return the correct status', () => {
    const ongoingUserCreation = getOnboardingStatus({
      isLoggedIn: false,
      currentUser: null,
    });

    const ongoingWorkspaceActivation = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.WorkspaceActivation,
      } as CurrentUser,
    });

    const ongoingProfileCreation = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.ProfileCreation,
      } as CurrentUser,
    });

    const ongoingSyncEmail = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.SyncEmail,
      } as CurrentUser,
    });

    const ongoingInviteTeam = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.InviteTeam,
      } as CurrentUser,
    });

    const completed = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: null,
      } as CurrentUser,
    });

    const incomplete = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.SubscriptionIncomplete,
      } as CurrentUser,
    });

    const incompleteButBillingDisabled = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: null,
      } as CurrentUser,
    });

    const canceled = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.SubscriptionCanceled,
      } as CurrentUser,
    });

    const past_due = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.SubscriptionPastDue,
      } as CurrentUser,
    });

    const unpaid = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.SubscriptionUnpaid,
      } as CurrentUser,
    });

    const completeWithoutSubscription = getOnboardingStatus({
      isLoggedIn: true,
      currentUser: {
        onboardingStep: OnboardingStep.CompletedWithoutSubscription,
      } as CurrentUser,
    });

    expect(ongoingUserCreation).toBe('ongoing_user_creation');
    expect(ongoingWorkspaceActivation).toBe('ongoing_workspace_activation');
    expect(ongoingProfileCreation).toBe('ongoing_profile_creation');
    expect(ongoingSyncEmail).toBe('ongoing_sync_email');
    expect(ongoingInviteTeam).toBe('ongoing_invite_team');
    expect(completed).toBe('completed');
    expect(incomplete).toBe('incomplete');
    expect(canceled).toBe('canceled');
    expect(past_due).toBe('past_due');
    expect(unpaid).toBe('unpaid');
    expect(incompleteButBillingDisabled).toBe('completed');
    expect(completeWithoutSubscription).toBe('completed_without_subscription');
  });
});
