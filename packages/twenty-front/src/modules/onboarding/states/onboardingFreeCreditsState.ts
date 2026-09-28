import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingFreeCreditsState =
  createAtomState<OnboardingFreeCredits>({
    key: 'onboardingFreeCreditsState',
    defaultValue: ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (payload) =>
      Number.isFinite(payload.importContacts) &&
      Number.isFinite(payload.installApps) &&
      Number.isFinite(payload.createProfile) &&
      Number.isFinite(payload.inviteTeam) &&
      Number.isFinite(payload.upgradeTrial) &&
      Number.isFinite(payload.seenCredits),
  });
