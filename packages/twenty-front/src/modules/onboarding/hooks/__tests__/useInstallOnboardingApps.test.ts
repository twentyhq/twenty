import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { createElement } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { useInstallOnboardingApps } from '@/onboarding/hooks/useInstallOnboardingApps';
import { onboardingFreeCreditsFamilyState } from '@/onboarding/states/onboardingFreeCreditsFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const mockTriggerInstallAppsOnboardingStep = jest.fn();

jest.mock('@/onboarding/hooks/useTriggerInstallAppsOnboardingStep', () => ({
  useTriggerInstallAppsOnboardingStep: () =>
    mockTriggerInstallAppsOnboardingStep,
}));

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
    () => {
      const setOnboardingConfig = useSetAtomState(onboardingConfigState);
      const onboardingFreeCredits = useAtomFamilyStateValue(
        onboardingFreeCreditsFamilyState,
        mockCurrentWorkspace.id,
      );
      const installOnboardingApps = useInstallOnboardingApps();

      return {
        setOnboardingConfig,
        onboardingFreeCredits,
        installOnboardingApps,
      };
    },
    { wrapper: Wrapper },
  );

  act(() => {
    result.current.setOnboardingConfig(onboardingConfig);
  });

  return result;
};

describe('useInstallOnboardingApps', () => {
  beforeEach(() => {
    localStorage.clear();
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    mockTriggerInstallAppsOnboardingStep.mockReset();
  });

  it('should credit the selected apps once the step succeeds', async () => {
    mockTriggerInstallAppsOnboardingStep.mockResolvedValue(undefined);

    const result = renderInstallHook();

    act(() => {
      result.current.installOnboardingApps.toggleApp('app-1');
    });
    act(() => {
      result.current.installOnboardingApps.toggleApp('app-2');
    });

    await act(async () => {
      await result.current.installOnboardingApps.installSelectedAppsAndContinue();
    });

    expect(mockTriggerInstallAppsOnboardingStep).toHaveBeenCalledWith({
      universalIdentifiers: ['app-1', 'app-2'],
      isAutoSkipped: false,
    });
    expect(result.current.onboardingFreeCredits.installApps).toBe(1);
  });

  it('should reset the completing state and not credit when the step fails', async () => {
    mockTriggerInstallAppsOnboardingStep.mockRejectedValue(
      new Error('network error'),
    );

    const result = renderInstallHook();

    act(() => {
      result.current.installOnboardingApps.toggleApp('app-1');
    });

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

    act(() => {
      result.current.installOnboardingApps.toggleApp('app-1');
    });

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
      result.current.installOnboardingApps.toggleApp('app-1');
    });

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
