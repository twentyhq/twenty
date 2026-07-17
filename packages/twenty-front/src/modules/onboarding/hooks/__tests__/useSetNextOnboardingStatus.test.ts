import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
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
  onboardingStatus: OnboardingStatus,
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
      return {
        currentUser,
        setCurrentUser,
        setCurrentWorkspace,
        setCurrentUserWorkspace,
        setBilling,
        setNextOnboardingStatus,
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
  return result.current.currentUser?.onboardingStatus;
};

describe('useSetNextOnboardingStatus', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should sync emails right after workspace activation', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.WORKSPACE_ACTIVATION,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.SYNC_EMAIL);
  });

  it('should install apps after syncing emails', () => {
    const nextOnboardingStatus = renderHooks(OnboardingStatus.SYNC_EMAIL);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.APPS_INSTALLATION);
  });

  it('should create profile after installing apps', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.APPS_INSTALLATION,
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PROFILE_CREATION);
  });

  it('should invite the team right after profile creation', () => {
    const nextOnboardingStatus = renderHooks(OnboardingStatus.PROFILE_CREATION);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
  });

  it('should complete after profile creation when more than 1 workspaceMember exist', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      {
        withOneWorkspaceMember: false,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should require a plan after profile creation when billing is enabled and the workspace has no subscription', () => {
    const nextOnboardingStatus = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      {
        withOneWorkspaceMember: false,
        isBillingEnabled: true,
        withSubscription: false,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
  });

  it('should complete after inviting the team when billing is disabled', () => {
    const nextOnboardingStatus = renderHooks(OnboardingStatus.INVITE_TEAM);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should complete after inviting the team when the workspace already has a subscription', () => {
    const nextOnboardingStatus = renderHooks(OnboardingStatus.INVITE_TEAM, {
      isBillingEnabled: true,
      withSubscription: true,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should require a plan after inviting the team when billing is enabled and the workspace has no subscription', () => {
    const nextOnboardingStatus = renderHooks(OnboardingStatus.INVITE_TEAM, {
      isBillingEnabled: true,
      withSubscription: false,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
  });
});
