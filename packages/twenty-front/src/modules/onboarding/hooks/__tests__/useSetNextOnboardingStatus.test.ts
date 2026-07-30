import { act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { bookCallMinEmployeeCountState } from '@/client-config/states/bookCallMinEmployeeCountState';
import { calendarBookingPageIdState } from '@/client-config/states/calendarBookingPageIdState';
import { isOnboardingAiChatEnabledState } from '@/client-config/states/isOnboardingAiChatEnabledState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { isWelcomeAnimationVisibleState } from '@/onboarding/states/isWelcomeAnimationVisibleState';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';
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

const mockCompanyEnrichment: WorkspaceCompanyEnrichment = {
  domain: 'acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  name: 'Acme Inc',
  website: null,
  industry: null,
  employeeCount: null,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
};

type RenderHooksOptions = {
  withSubscription?: boolean;
  isBillingEnabled?: boolean;
  withOneWorkspaceMember?: boolean;
  isOnboardingAiChatEnabled?: boolean;
  enrichedEmployeeCount?: number | null;
  bookCallMinEmployeeCount?: number | null;
};

const renderHooks = (
  onboardingStatus: OnboardingStatus | null,
  {
    withSubscription = false,
    isBillingEnabled = false,
    withOneWorkspaceMember = true,
    isOnboardingAiChatEnabled = false,
    enrichedEmployeeCount = null,
    bookCallMinEmployeeCount = null,
  }: RenderHooksOptions = {},
) => {
  jotaiStore.set(
    isOnboardingAiChatEnabledState.atom,
    isOnboardingAiChatEnabled,
  );

  const { result } = renderHook(
    () => {
      const [currentUser, setCurrentUser] = useAtomState(currentUserState);
      const setCurrentUserWorkspace = useSetAtomState(
        currentUserWorkspaceState,
      );
      const setCurrentWorkspace = useSetAtomState(currentWorkspaceState);
      const setBilling = useSetAtomState(billingState);
      const setCompanyEnrichment = useSetAtomState(companyEnrichmentState);
      const setBookCallMinEmployeeCount = useSetAtomState(
        bookCallMinEmployeeCountState,
      );
      const setCalendarBookingPageId = useSetAtomState(
        calendarBookingPageIdState,
      );
      const setNextOnboardingStatus = useSetNextOnboardingStatus();
      const isWelcomeAnimationVisible = useAtomStateValue(
        isWelcomeAnimationVisibleState,
      );
      const shouldOpenAiChatAfterOnboarding = useAtomStateValue(
        shouldOpenAiChatAfterOnboardingState,
      );
      return {
        currentUser,
        setCurrentUser,
        setCurrentWorkspace,
        setCurrentUserWorkspace,
        setBilling,
        setCompanyEnrichment,
        setBookCallMinEmployeeCount,
        setCalendarBookingPageId,
        setNextOnboardingStatus,
        isWelcomeAnimationVisible,
        shouldOpenAiChatAfterOnboarding,
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
    result.current.setCalendarBookingPageId('team/twenty/talk-to-us');
    result.current.setBookCallMinEmployeeCount(bookCallMinEmployeeCount);
    result.current.setCompanyEnrichment({
      ...mockCompanyEnrichment,
      employeeCount: enrichedEmployeeCount,
    });
  });
  act(() => {
    result.current.setNextOnboardingStatus();
  });
  return {
    nextOnboardingStatus: result.current.currentUser?.onboardingStatus,
    isWelcomeAnimationVisible: result.current.isWelcomeAnimationVisible,
    shouldOpenAiChatAfterOnboarding:
      result.current.shouldOpenAiChatAfterOnboarding,
  };
};

describe('useSetNextOnboardingStatus', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    resetJotaiStore();
  });

  it('should sync emails right after workspace activation', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.WORKSPACE_ACTIVATION);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.SYNC_EMAIL);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should install apps after syncing emails', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.SYNC_EMAIL);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.APPS_INSTALLATION);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should create profile after syncing emails when more than 1 workspaceMember exist', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.SYNC_EMAIL, {
      withOneWorkspaceMember: false,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PROFILE_CREATION);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should create profile after installing apps', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.APPS_INSTALLATION);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PROFILE_CREATION);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should invite the team right after profile creation', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.PROFILE_CREATION);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.INVITE_TEAM);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should complete after profile creation when more than 1 workspaceMember exist', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.PROFILE_CREATION, {
      withOneWorkspaceMember: false,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(true);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should require a plan after profile creation when billing is enabled and the workspace has no subscription', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.PROFILE_CREATION, {
      withOneWorkspaceMember: false,
      isBillingEnabled: true,
      withSubscription: false,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should complete after inviting the team when billing is disabled', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.INVITE_TEAM);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(true);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should complete after inviting the team when the workspace already has a subscription', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.INVITE_TEAM, {
      isBillingEnabled: true,
      withSubscription: true,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(true);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should require a plan after inviting the team when billing is enabled and the workspace has no subscription', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.INVITE_TEAM, {
      isBillingEnabled: true,
      withSubscription: false,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should book a call after inviting the team when the company clears the employee threshold', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.INVITE_TEAM, {
      isBillingEnabled: true,
      enrichedEmployeeCount: 320,
      bookCallMinEmployeeCount: 50,
    });
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.BOOK_CALL);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should book a call after profile creation when more than 1 workspaceMember exist', () => {
    const { nextOnboardingStatus } = renderHooks(
      OnboardingStatus.PROFILE_CREATION,
      {
        withOneWorkspaceMember: false,
        enrichedEmployeeCount: 320,
        bookCallMinEmployeeCount: 50,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.BOOK_CALL);
  });

  it.each([
    { enrichedEmployeeCount: 49, bookCallMinEmployeeCount: 50 },
    { enrichedEmployeeCount: null, bookCallMinEmployeeCount: 50 },
    { enrichedEmployeeCount: 320, bookCallMinEmployeeCount: null },
  ])(
    'should skip the book-call step for employeeCount $enrichedEmployeeCount and threshold $bookCallMinEmployeeCount',
    (options) => {
      const { nextOnboardingStatus } = renderHooks(
        OnboardingStatus.INVITE_TEAM,
        { isBillingEnabled: true, ...options },
      );
      expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    },
  );

  it('should require a plan after booking a call when billing is enabled and the workspace has no subscription', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.BOOK_CALL,
      {
        isBillingEnabled: true,
        enrichedEmployeeCount: 320,
        bookCallMinEmployeeCount: 50,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.PLAN_REQUIRED);
    expect(isWelcomeAnimationVisible).toBe(false);
  });

  it('should complete after booking a call when billing is disabled', () => {
    const { nextOnboardingStatus, isWelcomeAnimationVisible } = renderHooks(
      OnboardingStatus.BOOK_CALL,
      {
        enrichedEmployeeCount: 320,
        bookCallMinEmployeeCount: 50,
      },
    );
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(true);
  });

  it('should not show the welcome animation when the onboarding was already completed', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(OnboardingStatus.COMPLETED);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should not show the welcome animation when the onboarding status is unknown', () => {
    const {
      nextOnboardingStatus,
      isWelcomeAnimationVisible,
      shouldOpenAiChatAfterOnboarding,
    } = renderHooks(null);
    expect(nextOnboardingStatus).toEqual(OnboardingStatus.COMPLETED);
    expect(isWelcomeAnimationVisible).toBe(false);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  it('should open the ai chat after onboarding when it is enabled', () => {
    const { isWelcomeAnimationVisible, shouldOpenAiChatAfterOnboarding } =
      renderHooks(OnboardingStatus.INVITE_TEAM, {
        isOnboardingAiChatEnabled: true,
      });
    expect(isWelcomeAnimationVisible).toBe(true);
    expect(shouldOpenAiChatAfterOnboarding).toBe(true);
  });

  it('should still show the welcome animation when the ai chat is disabled', () => {
    const { isWelcomeAnimationVisible, shouldOpenAiChatAfterOnboarding } =
      renderHooks(OnboardingStatus.INVITE_TEAM, {
        isOnboardingAiChatEnabled: false,
      });
    expect(isWelcomeAnimationVisible).toBe(true);
    expect(shouldOpenAiChatAfterOnboarding).toBe(false);
  });

  // Falling through to COMPLETED from the plan step would wave the paywall through.
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

  // A caller awaits the enrichment and then advances, so the callback it captured at
  // render time must still see the value that landed during the await.
  it('should honour an enrichment that arrives after the callback was captured', () => {
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
    jotaiStore.set(calendarBookingPageIdState.atom, 'team/twenty/talk-to-us');
    jotaiStore.set(bookCallMinEmployeeCountState.atom, 50);

    const { result } = renderHook(() => useSetNextOnboardingStatus(), {
      wrapper: Wrapper,
    });

    const advanceCapturedBeforeEnrichment = result.current;

    act(() => {
      jotaiStore.set(companyEnrichmentState.atom, {
        ...mockCompanyEnrichment,
        employeeCount: 320,
      });
      advanceCapturedBeforeEnrichment();
    });

    expect(jotaiStore.get(currentUserState.atom)?.onboardingStatus).toEqual(
      OnboardingStatus.BOOK_CALL,
    );
  });
});
