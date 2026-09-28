import { createStore } from 'jotai';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { currentWorkspaceOnboardingFreeCreditsSelector } from '@/onboarding/states/selectors/currentWorkspaceOnboardingFreeCreditsSelector';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const EARNED_ONBOARDING_FREE_CREDITS = {
  ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
  importContacts: 2,
  seenCredits: 2,
};

describe('currentWorkspaceOnboardingFreeCreditsSelector', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should read the credits of the current workspace', () => {
    const store = createStore();

    store.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    store.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      EARNED_ONBOARDING_FREE_CREDITS,
    );

    expect(
      store.get(currentWorkspaceOnboardingFreeCreditsSelector.atom),
    ).toEqual(EARNED_ONBOARDING_FREE_CREDITS);
  });

  it('should read the default credits while the current workspace is not loaded', () => {
    const store = createStore();

    store.set(currentWorkspaceState.atom, null);
    store.set(
      onboardingFreeCreditsFamilyState.atomFamily(''),
      EARNED_ONBOARDING_FREE_CREDITS,
    );

    expect(
      store.get(currentWorkspaceOnboardingFreeCreditsSelector.atom),
    ).toEqual(ONBOARDING_FREE_CREDITS_DEFAULT_VALUE);
  });
});
