import { type OnboardingFreeCredits } from '@/onboarding/types/OnboardingFreeCredits';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const onboardingFreeCreditsState =
  createAtomState<OnboardingFreeCredits>({
    key: 'onboardingFreeCreditsState',
    defaultValue: { importContacts: 0, inviteTeam: 0, installApps: 0 },
    useLocalStorage: true,
    localStorageOptions: { getOnInit: true },
    validateInitFn: (payload) =>
      Number.isFinite(payload.importContacts) &&
      Number.isFinite(payload.inviteTeam) &&
      Number.isFinite(payload.installApps),
  });
