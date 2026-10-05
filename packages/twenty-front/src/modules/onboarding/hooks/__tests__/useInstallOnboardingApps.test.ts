import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const mockTriggerInstallAppsOnboardingStep = jest.fn();

jest.mock('@/onboarding/hooks/useTriggerInstallAppsOnboardingStep', () => ({
  useTriggerInstallAppsOnboardingStep: () =>
    mockTriggerInstallAppsOnboardingStep,
}));

const AVAILABLE_APPS = ['app-1', 'app-2'];

const onboardingConfig: OnboardingConfig = {
  importContactsCreditsReward: 2,
  inviteTeamCreditsRewardPerUser: 3,
  installAppsCreditsReward: 1,
  createProfileCreditsReward: 0.5,
  upgradeCreditsReward: 5,
  inviteTeamMaxInvites: 3,
};

const Wrapper = ({ children }: { children: React.ReactNode }) =>
  createElement(JotaiProvider, { store: jotaiStore }, children);

const renderInstallHook = () => {
  const { result } = renderHook(
    () => ({
      onboardingFreeCredits: useAtomFamilyStateValue(
        onboardingFreeCreditsFamilyState,
        mockCurrentWorkspace.id,
      ),
      installOnboardingApps: useInstallOnboardingApps(AVAILABLE_APPS),
    }),
    { wrapper: Wrapper },
  );

  return result;
};

describe('useInstallOnboardingApps', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(onboardingConfigState.atom, onboardingConfig);
    jotaiStore.set(currentUserState.atom, {
      ...mockedUserData,
      isWorkspaceCreator: true,
    });
    mockTriggerInstallAppsOnboardingStep.mockReset();
  });

  it('should install and credit every available app by default', async () => {
    mockTriggerInstallAppsOnboardingStep.mockResolvedValue(undefined);

    const result = renderInstallHook();

    await act(async () => {
      await result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    expect(mockTriggerInstallAppsOnboardingStep).toHaveBeenCalledWith({
      universalIdentifiers: ['app-1', 'app-2'],
      isAutoSkipped: false,
    });
    expect(result.current.onboardingFreeCredits.installApps).toBe(1);
  });

  it('should leave out the apps turned off', async () => {
    mockTriggerInstallAppsOnboardingStep.mockResolvedValue(undefined);

    const result = renderInstallHook();

    act(() => {
      result.current.installOnboardingApps.toggleApp('app-1');
    });

    await act(async () => {
      await result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    expect(mockTriggerInstallAppsOnboardingStep).toHaveBeenCalledWith({
      universalIdentifiers: ['app-2'],
      isAutoSkipped: false,
    });
  });

  it('should credit the apps as soon as their install starts', () => {
    mockTriggerInstallAppsOnboardingStep.mockReturnValue(new Promise(() => {}));

    const result = renderInstallHook();

    act(() => {
      void result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    expect(result.current.onboardingFreeCredits.installApps).toBe(1);
  });

  it('should not credit a skip', async () => {
    mockTriggerInstallAppsOnboardingStep.mockResolvedValue(undefined);

    const result = renderInstallHook();

    await act(async () => {
      await result.current.installOnboardingApps.skip();
    });

    expect(result.current.onboardingFreeCredits.installApps).toBe(0);
  });

  it('should reset the completing state and the credits when the step fails', async () => {
    mockTriggerInstallAppsOnboardingStep.mockRejectedValue(
      new Error('network error'),
    );

    const result = renderInstallHook();

    await act(async () => {
      await result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    expect(result.current.installOnboardingApps.isCompleting).toBe(false);
    expect(result.current.onboardingFreeCredits.installApps).toBe(0);
  });

  it('should allow retrying after a failed attempt', async () => {
    mockTriggerInstallAppsOnboardingStep
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce(undefined);

    const result = renderInstallHook();

    await act(async () => {
      await result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    await act(async () => {
      await result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    expect(mockTriggerInstallAppsOnboardingStep).toHaveBeenCalledTimes(2);
    expect(result.current.onboardingFreeCredits.installApps).toBe(1);
  });

  it('should ignore a second submission while one is already in flight', async () => {
    let resolveTrigger: () => void = () => {};

    mockTriggerInstallAppsOnboardingStep.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveTrigger = resolve;
      }),
    );

    const result = renderInstallHook();

    act(() => {
      void result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    expect(result.current.installOnboardingApps.isCompleting).toBe(true);

    act(() => {
      void result.current.installOnboardingApps.skip();
    });

    expect(mockTriggerInstallAppsOnboardingStep).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveTrigger();
    });
  });
});
