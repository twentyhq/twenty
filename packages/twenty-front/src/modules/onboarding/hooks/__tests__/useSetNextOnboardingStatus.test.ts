import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
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

type RenderHooksOptions = {
  withSubscription?: boolean;
  isBillingEnabled?: boolean;
  withOneWorkspaceMember?: boolean;
};

const renderHooks = (
  onboardingStatus: OnboardingStatus | null,
  {
    withSubscription = false,
    isBillingEnabled = false,
    withOneWorkspaceMember = true,
  }: RenderHooksOptions = {},
) => {
  const { result } = renderHook(
    () => {
      const [currentUser, setCurrentUser] = useAtomState(currentUserState);
      const setCurrentUserWorkspace = useSetAtomState(
        currentUserWorkspaceState,
      );
      const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
      const setBilling = useSetAtomState(billingState);
      const setNextOnboardingStatus = useSetNextOnboardingStatus();
      const isWelcomeAnimationVisible = useAtomStateValue(
        isWelcomeAnimationVisibleState,
      );
      return {
        currentUser,
        setCurrentUser,
        setCurrentWorkspace,
        setCurrentUserWorkspace,
        setBilling,
        setNextOnboardingStatus,
        isWelcomeAnimationVisible,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  act(() => {
    result.current.setCurrentUser({ ...mockedUserData, onboardingStatus });
    result.current.setCurrentUserWorkspace(mockedUserData.currentUserWorkspace);
    result.current.setCurrentWorkspace({
      ...mockCurrentWorkspace,
      billingSubscriptions: withSubscription
        ? mockCurrentWorkspace.billingSubscriptions
        : [],
      workspaceMembersCount: withOneWorkspaceMember ? 1 : 2,
    });
    result.current.setBilling({
      __typename: 'Billing',
      isBillingEnabled,
      trialPeriods: [],
    });
  });
  act(() => {
    result.current.setNextOnboardingStatus();
  });
  return {
    nextOnboardingStatus: result.current.currentUser?.onboardingStatus,
    isWelcomeAnimationVisible: result.current.isWelcomeAnimationVisible,
  };
};

describe('useSetNextOnboardingStatus', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should sync emails right after workspace activation', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.WORKSPACE_ACTIVATION,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.SYNC_EMAIL);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should install apps after syncing emails', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.SYNC_EMAIL,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.APPS_INSTALLATION);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should create profile after installing apps', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.APPS_INSTALLATION,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PROFILE_CREATION);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should invite the team right after profile creation', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should complete after profile creation when more than 1 workspaceMember exist', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      {
        withOneWorkspaceMember: false,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(true);
  });

  it('should require a plan after profile creation when billing is enabled and the workspace has no subscription', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      {
        withOneWorkspaceMember: false,
        isBillingEnabled: true,
        withSubscription: false,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should complete after inviting the team when billing is disabled', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.INVITE_TEAM,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(true);
  });

  it('should complete after inviting the team when the workspace already has a subscription', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.INVITE_TEAM,
      {
        isBillingEnabled: true,
        withSubscription: true,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(true);
  });

  it('should require a plan after inviting the team when billing is enabled and the workspace has no subscription', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.INVITE_TEAM,
      {
        isBillingEnabled: true,
        withSubscription: false,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should not show the welcome animation when the onboarding was already completed', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.COMPLETED,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should not show the welcome animation when the onboarding status is unknown', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } =
      renderHooks(null);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(false);
  });
});
