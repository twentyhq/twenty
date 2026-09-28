import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const renderSetStepFreeCreditsHook = () =>
  renderHook(
    () => ({
      onboardingFreeCredits: useAtomStateValue(onboardingFreeCreditsState),
      setOnboardingStepFreeCredits: useSetOnboardingStepFreeCredits(),
    }),
    { wrapper: Wrapper },
  ).result;

describe('useSetOnboardingStepFreeCredits', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
  });

  it('should keep the seen credits when a step earns more', () => {
    jotaiStore.set(onboardingFreeCreditsState.atom, {
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      seenCredits: 2,
    });

    const result = renderSetStepFreeCreditsHook();

    act(() => {
      result.current.setOnboardingStepFreeCredits('installApps', 1);
    });

    expect(result.current.onboardingFreeCredits).toEqual({
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      installApps: 1,
      seenCredits: 2,
    });
  });

  it('should count quiet credits as already seen', () => {
    jotaiStore.set(onboardingFreeCreditsState.atom, {
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      installApps: 1,
      seenCredits: 2,
    });

    const result = renderSetStepFreeCreditsHook();

    act(() => {
      result.current.setOnboardingStepFreeCredits('upgradeTrial', 4, {
        isQuiet: true,
      });
    });

    expect(result.current.onboardingFreeCredits).toEqual({
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      installApps: 1,
      upgradeTrial: 4,
      seenCredits: 6,
    });
  });

  it('should keep unseen credits when a quiet reward is removed', () => {
    jotaiStore.set(onboardingFreeCreditsState.atom, {
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      seenCredits: 0,
    });

    const result = renderSetStepFreeCreditsHook();

    act(() => {
      result.current.setOnboardingStepFreeCredits('upgradeTrial', 0.5, {
        isQuiet: true,
      });
    });

    expect(result.current.onboardingFreeCredits).toEqual({
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      upgradeTrial: 0.5,
      seenCredits: 0.5,
    });

    act(() => {
      result.current.setOnboardingStepFreeCredits('upgradeTrial', 0, {
        isQuiet: true,
      });
    });

    expect(result.current.onboardingFreeCredits).toEqual({
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      seenCredits: 0,
    });
  });

  it('should lower the seen credits when a step loses its reward', () => {
    jotaiStore.set(onboardingFreeCreditsState.atom, {
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      installApps: 1,
      seenCredits: 3,
    });

    const result = renderSetStepFreeCreditsHook();

    act(() => {
      result.current.setOnboardingStepFreeCredits('installApps', 0);
    });

    expect(result.current.onboardingFreeCredits).toEqual({
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      seenCredits: 2,
    });
  });
});
