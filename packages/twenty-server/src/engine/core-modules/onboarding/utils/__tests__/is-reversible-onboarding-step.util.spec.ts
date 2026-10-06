import { OnboardingStatus } from 'src/engine/core-modules/onboarding/enums/onboarding-status.enum';
import { isReversibleOnboardingStep } from 'src/engine/core-modules/onboarding/utils/is-reversible-onboarding-step.util';

describe('isReversibleOnboardingStep', () => {
  it.each([
    OnboardingStatus.SYNC_EMAIL,
    OnboardingStatus.PROFILE_CREATION,
    OnboardingStatus.INVITE_TEAM,
    OnboardingStatus.BOOK_CALL,
  ])('should accept the reversible step %p', (step) => {
    expect(isReversibleOnboardingStep(step)).toBe(true);
  });

  it.each([
    OnboardingStatus.PLAN_REQUIRED,
    OnboardingStatus.WORKSPACE_ACTIVATION,
    OnboardingStatus.COMPLETED,
  ])('should reject the non-reversible status %p', (status) => {
    expect(isReversibleOnboardingStep(status)).toBe(false);
  });

  it.each(['APPS_INSTALLATION', 'UNKNOWN_STEP', null, undefined, 42])(
    'should reject the stored value %p',
    (value) => {
      expect(isReversibleOnboardingStep(value)).toBe(false);
    },
  );
});
