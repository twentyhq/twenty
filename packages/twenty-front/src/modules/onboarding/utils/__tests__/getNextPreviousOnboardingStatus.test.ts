import { getNextPreviousOnboardingStatus } from '@/onboarding/utils/getNextPreviousOnboardingStatus';
import { OnboardingStatus } from '~/generated-metadata/graphql';

describe('getNextPreviousOnboardingStatus', () => {
  it('should make the step being left the one to go back to when it was reversible', () => {
    expect(
      getNextPreviousOnboardingStatus({
        stepHistoryEffect: 'recordAsReversible',
        currentOnboardingStatus: OnboardingStatus.SYNC_EMAIL,
        currentPreviousOnboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION,
      }),
    ).toBe(OnboardingStatus.SYNC_EMAIL);
  });

  it('should drop every step to go back to after an irreversible step', () => {
    expect(
      getNextPreviousOnboardingStatus({
        stepHistoryEffect: 'clearAfterIrreversibleStep',
        currentOnboardingStatus: OnboardingStatus.INVITE_TEAM,
        currentPreviousOnboardingStatus: OnboardingStatus.PROFILE_CREATION,
      }),
    ).toBeNull();
  });

  it('should keep the earlier step to go back to when the history is untouched', () => {
    expect(
      getNextPreviousOnboardingStatus({
        stepHistoryEffect: 'leaveUnchanged',
        currentOnboardingStatus: OnboardingStatus.APPS_INSTALLATION,
        currentPreviousOnboardingStatus: OnboardingStatus.SYNC_EMAIL,
      }),
    ).toBe(OnboardingStatus.SYNC_EMAIL);
  });

  it('should return nothing to go back to when there was none and the history is untouched', () => {
    expect(
      getNextPreviousOnboardingStatus({
        stepHistoryEffect: 'leaveUnchanged',
        currentOnboardingStatus: OnboardingStatus.SYNC_EMAIL,
        currentPreviousOnboardingStatus: null,
      }),
    ).toBeNull();
  });
});
