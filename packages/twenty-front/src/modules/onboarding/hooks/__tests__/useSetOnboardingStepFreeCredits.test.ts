import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const renderSetStepFreeCreditsHook = () =>
  renderHook(
    () => ({
      onboardingFreeCredits: useAtomFamilyStateValue(
        onboardingFreeCreditsFamilyState,
        mockCurrentWorkspace.id,
      ),
      setOnboardingStepFreeCredits: useSetOnboardingStepFreeCredits(),
    }),
    { wrapper: Wrapper },
  ).result;

describe('useSetOnboardingStepFreeCredits', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  });

  it('should keep the seen credits when a step earns more', () => {
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        importContacts: 2,
        seenCredits: 2,
      },
    );

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
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        importContacts: 2,
        installApps: 1,
        seenCredits: 2,
      },
    );

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
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        importContacts: 2,
        seenCredits: 0,
      },
    );

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

  it('should leave the credits of other workspaces untouched', () => {
    const otherWorkspaceFreeCredits = {
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      importContacts: 2,
      seenCredits: 2,
    };

    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily('other-workspace-id'),
      otherWorkspaceFreeCredits,
    );

    const result = renderSetStepFreeCreditsHook();

    act(() => {
      result.current.setOnboardingStepFreeCredits('installApps', 1);
    });

    expect(result.current.onboardingFreeCredits).toEqual({
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      installApps: 1,
    });
    expect(
      jotaiStore.get(
        onboardingFreeCreditsFamilyState.atomFamily('other-workspace-id'),
      ),
    ).toEqual(otherWorkspaceFreeCredits);
  });

  it('should lower the seen credits when a step loses its reward', () => {
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        importContacts: 2,
        installApps: 1,
        seenCredits: 3,
      },
    );

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
