import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { isOnboardingInboxEnabledState } from '@/client-config/states/isOnboardingInboxEnabledState';
import { ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY } from '@/onboarding/constants/OnboardingBookCallPendingUserVarKey';
import { ONBOARDING_INVITE_TEAM_PENDING_USER_VAR_KEY } from '@/onboarding/constants/OnboardingInviteTeamPendingUserVarKey';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { type OnboardingStepHistoryEffect } from '@/onboarding/types/OnboardingStepHistoryEffect';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';
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
  isOnboardingAiChatEnabled?: boolean;
  stepHistoryEffect?: OnboardingStepHistoryEffect;
  isBookCallOnboardingStepEnabled?: boolean;
  isBookCallOnboardingStepPending?: boolean;
  isInviteTeamOnboardingStepPending?: boolean;
  isWorkspaceCreator?: boolean;
};

const renderHooks = (
  onboardingStatus: OnboardingStatus | null,
  {
    withSubscription = false,
    isBillingEnabled = false,
    withOneWorkspaceMember = true,
    isOnboardingAiChatEnabled = false,
    stepHistoryEffect = 'leaveUnchanged',
    isBookCallOnboardingStepEnabled = false,
    isBookCallOnboardingStepPending = false,
    isInviteTeamOnboardingStepPending = true,
    isWorkspaceCreator = true,
  }: RenderHooksOptions = {},
) => {
  jotaiStore.set(isOnboardingInboxEnabledState.atom, isOnboardingAiChatEnabled);

  const { result } = renderHook(
    () => {
      const [currentUser, setCurrentUser] = useAtomState(currentUserState);
      const setCurrentUserWorkspace = useSetAtomState(
        currentUserWorkspaceState,
      );
      const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
      const setBilling = useSetAtomState(billingState);
      const setIsBookCallOnboardingStepEnabled = useSetAtomState(
        isBookCallOnboardingStepEnabledState,
      );
      const setNextOnboardingStatus = useSetNextOnboardingStatus();
      const shouldOpenInboxAfterOnboarding = useAtomStateValue(
        shouldOpenInboxAfterOnboardingState,
      );
      return {
        currentUser,
        setCurrentUser,
        setCurrentWorkspace,
        setCurrentUserWorkspace,
        setBilling,
        setIsBookCallOnboardingStepEnabled,
        setNextOnboardingStatus,
        shouldOpenInboxAfterOnboarding,
      };
    },
    {
      wrapper: Wrapper,
    },
  );
  act(() => {
    result.current.setCurrentUser({
      ...mockedUserData,
      onboardingStatus,
      isWorkspaceCreator,
      userVars: {
        ...mockedUserData.userVars,
        [ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY]:
          isBookCallOnboardingStepPending,
        [ONBOARDING_INVITE_TEAM_PENDING_USER_VAR_KEY]:
          isInviteTeamOnboardingStepPending,
      },
    });
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
    result.current.setIsBookCallOnboardingStepEnabled(
      isBookCallOnboardingStepEnabled,
    );
  });
  act(() => {
    result.current.setNextOnboardingStatus({ stepHistoryEffect });
  });
  return {
    nextOnboardingStatus: result.current.currentUser?.onboardingStatus,
    previousOnboardingStatus:
      result.current.currentUser?.previousOnboardingStatus,
    shouldOpenInboxAfterOnboarding:
      result.current.shouldOpenInboxAfterOnboarding,
  };
};

describe('useSetNextOnboardingStatus', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    resetJotaiStore();
  });

  it('should sync emails right after workspace activation', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.WORKSPACE_ACTIVATION);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.SYNC_EMAIL);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should create profile after syncing emails', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.SYNC_EMAIL);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PROFILE_CREATION);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should invite the team right after profile creation', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.PROFILE_CREATION);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should skip the invite step after profile creation when the server did not flag it', () => {
    const { nextOnboardingStatus } = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      {
        isInviteTeamOnboardingStepPending: false,
        isBillingEnabled: true,
        withSubscription: false,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
  });

  it('should complete after profile creation when more than 1 workspaceMember exist', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.PROFILE_CREATION, {
        withOneWorkspaceMember: false,
      });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should require a plan after profile creation when billing is enabled and the workspace has no subscription', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.PROFILE_CREATION, {
        withOneWorkspaceMember: false,
        isBillingEnabled: true,
        withSubscription: false,
      });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should complete after inviting the team when billing is disabled', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.INVITE_TEAM);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should complete after inviting the team when the workspace already has a subscription', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.INVITE_TEAM, {
        isBillingEnabled: true,
        withSubscription: true,
      });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should require a plan after inviting the team when billing is enabled and the workspace has no subscription', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.INVITE_TEAM, {
        isBillingEnabled: true,
        withSubscription: false,
      });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should book a call after inviting the team when the server flagged the step', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.INVITE_TEAM, {
        isBillingEnabled: true,
        isBookCallOnboardingStepEnabled: true,
        isBookCallOnboardingStepPending: true,
      });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.BOOK_CALL);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should book a call after profile creation when more than 1 workspaceMember exist', () => {
    const { nextOnboardingStatus } = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      {
        withOneWorkspaceMember: false,
        isBillingEnabled: true,
        isBookCallOnboardingStepEnabled: true,
        isBookCallOnboardingStepPending: true,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.BOOK_CALL);
  });

  it('should skip the book-call step once the workspace has a subscription, matching the server', () => {
    const { nextOnboardingStatus } = renderHooks(OnboardingStatus.INVITE_TEAM, {
      isBillingEnabled: true,
      withSubscription: true,
      isBookCallOnboardingStepEnabled: true,
      isBookCallOnboardingStepPending: true,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it.each([
    {
      isBookCallOnboardingStepEnabled: true,
      isBookCallOnboardingStepPending: false,
    },
    {
      isBookCallOnboardingStepEnabled: false,
      isBookCallOnboardingStepPending: true,
    },
    {
      isBookCallOnboardingStepEnabled: false,
      isBookCallOnboardingStepPending: false,
    },
  ])(
    'should skip the book-call step when enabled is $isBookCallOnboardingStepEnabled and pending is $isBookCallOnboardingStepPending',
    (options) => {
      const { nextOnboardingStatus } = renderHooks(
        OnboardingStatus.INVITE_TEAM,
        { isBillingEnabled: true, ...options },
      );
      expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    },
  );

  it('should require a plan after booking a call when billing is enabled and the workspace has no subscription', () => {
    const { nextOnboardingStatus } = renderHooks(OnboardingStatus.BOOK_CALL, {
      isBillingEnabled: true,
      isBookCallOnboardingStepEnabled: true,
      isBookCallOnboardingStepPending: true,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
  });

  it('should complete after booking a call when billing is disabled', () => {
    const { nextOnboardingStatus } = renderHooks(OnboardingStatus.BOOK_CALL, {
      isBookCallOnboardingStepEnabled: true,
      isBookCallOnboardingStepPending: true,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should not open the ai chat when the onboarding was already completed', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(OnboardingStatus.COMPLETED);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should not open the ai chat when the onboarding status is unknown', () => {
    const { nextOnboardingStatus, shouldOpenInboxAfterOnboarding } =
      renderHooks(null);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should open the ai chat after onboarding when it is enabled', () => {
    const { shouldOpenInboxAfterOnboarding } = renderHooks(
      OnboardingStatus.INVITE_TEAM,
      {
        isOnboardingAiChatEnabled: true,
      },
    );
    expect(shouldOpenInboxAfterOnboarding).toBe(true);
  });

  it('should not open the ai chat after onboarding for an invitee', () => {
    const { shouldOpenInboxAfterOnboarding } = renderHooks(
      OnboardingStatus.INVITE_TEAM,
      {
        isOnboardingAiChatEnabled: true,
        isWorkspaceCreator: false,
      },
    );
    expect(shouldOpenInboxAfterOnboarding).toBe(false);
  });

  it('should make the left step the one to go back to when it was reversible', () => {
    const { previousOnboardingStatus } = renderHooks(
      OnboardingStatus.SYNC_EMAIL,
      { stepHistoryEffect: 'recordAsReversible' },
    );
    expect(previousOnboardingStatus).toEqual(OnboardingStatus.SYNC_EMAIL);
  });

  it('should keep the earlier reversible step when the left step was not reversible', () => {
    const { previousOnboardingStatus } = renderHooks(
      OnboardingStatus.SYNC_EMAIL,
      { stepHistoryEffect: 'leaveUnchanged' },
    );
    expect(previousOnboardingStatus).toBeUndefined();
  });

  it('should drop every step to go back to after an irreversible step', () => {
    const { previousOnboardingStatus } = renderHooks(
      OnboardingStatus.INVITE_TEAM,
      { stepHistoryEffect: 'clearAfterIrreversibleStep' },
    );
    expect(previousOnboardingStatus).toBeNull();
  });

  it('should stay on the plan step when advancing from it without a subscription', () => {
    const { nextOnboardingStatus } = renderHooks(
      OnboardingStatus.PLAN_REQUIRED,
      { isBillingEnabled: true, withSubscription: false },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
  });

  it('should complete when advancing from the plan step with a subscription', () => {
    const { nextOnboardingStatus } = renderHooks(
      OnboardingStatus.PLAN_REQUIRED,
      { isBillingEnabled: true, withSubscription: true },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
  });

  it('should honour a pending book-call flag that arrives after the callback was captured', () => {
    jotaiStore.set(currentUserState.atom, {
      ...mockedUserData,
      onboardingStatus: OnboardingStatus.INVITE_TEAM,
    });
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      billingSubscriptions: [],
      workspaceMembersCount: 1,
    });
    jotaiStore.set(billingState.atom, {
      __typename: 'Billing',
      isBillingEnabled: true,
      trialPeriods: [],
    } as never);
    jotaiStore.set(isBookCallOnboardingStepEnabledState.atom, true);

    const { result } = renderHook(() => useSetNextOnboardingStatus(), {
      wrapper: Wrapper,
    });

    const advanceCapturedBeforeEnrichment = result.current;

    act(() => {
      jotaiStore.set(currentUserState.atom, (current) => ({
        ...current!,
        userVars: {
          ...current?.userVars,
          [ONBOARDING_BOOK_CALL_PENDING_USER_VAR_KEY]: true,
        },
      }));
      advanceCapturedBeforeEnrichment({ stepHistoryEffect: 'leaveUnchanged' });
    });

    expect(jotaiStore.get(currentUserState.atom)?.onboardingStatus).toEqual(
      OnboardingStatus.BOOK_CALL,
    );
  });

  it('should still sync emails when the server status landed before advancing', () => {
    jotaiStore.set(currentUserState.atom, {
      ...mockedUserData,
      onboardingStatus: OnboardingStatus.WORKSPACE_ACTIVATION,
    });
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      billingSubscriptions: [],
      workspaceMembersCount: 1,
    });

    const { result } = renderHook(() => useSetNextOnboardingStatus(), {
      wrapper: Wrapper,
    });

    const advanceCapturedBeforeActivation = result.current;

    act(() => {
      jotaiStore.set(currentUserState.atom, {
        ...mockedUserData,
        onboardingStatus: OnboardingStatus.SYNC_EMAIL,
      });
      advanceCapturedBeforeActivation({ stepHistoryEffect: 'leaveUnchanged' });
    });

    expect(jotaiStore.get(currentUserState.atom)?.onboardingStatus).toEqual(
      OnboardingStatus.SYNC_EMAIL,
    );
  });
});
