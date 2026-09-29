import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { ONBOARDING_FREE_CREDITS_DEFAULT_VALUE } from '@/onboarding/constants/OnboardingFreeCreditsDefaultValue';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const setOnboardingStatus = (onboardingStatus: OnboardingStatus) =>
  jotaiStore.set(currentUserState.atom, {
    ...mockedUserData,
    onboardingStatus,
  });

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
    setOnboardingStatus(OnboardingStatus.PLAN_REQUIRED);
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
    setOnboardingStatus(OnboardingStatus.PLAN_REQUIRED);
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

  it('should not count quiet credits as seen before their step counts', () => {
    setOnboardingStatus(OnboardingStatus.SYNC_EMAIL);
    jotaiStore.set(
      onboardingFreeCreditsFamilyState.atomFamily(mockCurrentWorkspace.id),
      {
        ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
        seenCredits: 0,
      },
    );

    const result = renderSetStepFreeCreditsHook();

    act(() => {
      result.current.setOnboardingStepFreeCredits('upgradeTrial', 2, {
        isQuiet: true,
      });
    });

    expect(result.current.onboardingFreeCredits).toEqual({
      ...ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
      upgradeTrial: 2,
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

  it('should not write any credits while the current workspace is not loaded', () => {
    jotaiStore.set(currentWorkspaceState.atom, null);

    const result = renderSetStepFreeCreditsHook();

    act(() => {
      result.current.setOnboardingStepFreeCredits('installApps', 1);
    });

    expect(
      jotaiStore.get(onboardingFreeCreditsFamilyState.atomFamily('')),
    ).toEqual(ONBOARDING_FREE_CREDITS_DEFAULT_VALUE);

    act(() => {
      jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    });

    expect(result.current.onboardingFreeCredits).toEqual(
      ONBOARDING_FREE_CREDITS_DEFAULT_VALUE,
    );
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
