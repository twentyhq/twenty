import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { isBookCallOnboardingStepEnabledState } from '@/client-config/states/isBookCallOnboardingStepEnabledState';
import { isCompanyEnrichmentEnabledState } from '@/client-config/states/isCompanyEnrichmentEnabledState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { onboardingInviteTeamEmailsDraftState } from '@/onboarding/states/onboardingInviteTeamEmailsDraftState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mockSendInvitation = jest.fn();
const mockSetNextOnboardingStatus = jest.fn();
const mockWaitForCompanyEnrichmentSettlement = jest.fn();

jest.mock('@/workspace-invitation/hooks/useCreateWorkspaceInvitation', () => ({
  useCreateWorkspaceInvitation: () => ({
    sendInvitation: mockSendInvitation,
  }),
}));

jest.mock('@/onboarding/hooks/useSetNextOnboardingStatus', () => ({
  useSetNextOnboardingStatus: () => mockSetNextOnboardingStatus,
}));

jest.mock('@/onboarding/utils/waitForCompanyEnrichmentSettlement', () => ({
  waitForCompanyEnrichmentSettlement: (...args: unknown[]) =>
    mockWaitForCompanyEnrichmentSettlement(...args),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: () => ({ data: undefined, loading: false }),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: jest.fn(),
}));

dynamicActivate(SOURCE_LOCALE);

const renderInviteTeam = () =>
  renderHook(() => useInviteTeam(), {
    wrapper: ({ children }) =>
      JotaiProvider({
        store: jotaiStore,
        children: I18nProvider({ i18n, children }),
      }),
  });

describe('useInviteTeam', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetJotaiStore();
    jest.clearAllMocks();
    mockSendInvitation.mockResolvedValue({});
    mockWaitForCompanyEnrichmentSettlement.mockResolvedValue(undefined);
    jotaiStore.set(isBookCallOnboardingStepEnabledState.atom, true);
    jotaiStore.set(isCompanyEnrichmentEnabledState.atom, true);
  });

  it('should not wait for an enrichment that will never run', async () => {
    jotaiStore.set(isCompanyEnrichmentEnabledState.atom, false);

    const { result } = renderInviteTeam();

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(mockWaitForCompanyEnrichmentSettlement).not.toHaveBeenCalled();
    expect(mockSetNextOnboardingStatus).toHaveBeenCalled();
  });

  it('should not wait for the enrichment when the book-call step is disabled', async () => {
    jotaiStore.set(isBookCallOnboardingStepEnabledState.atom, false);

    const { result } = renderInviteTeam();

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(mockWaitForCompanyEnrichmentSettlement).not.toHaveBeenCalled();
    expect(mockSetNextOnboardingStatus).toHaveBeenCalled();
  });

  it('should wait for the enrichment answer before advancing', async () => {
    let resolveCompanyEnrichmentSettlement: () => void = () => {};

    mockWaitForCompanyEnrichmentSettlement.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveCompanyEnrichmentSettlement = resolve;
      }),
    );

    const { result } = renderInviteTeam();

    let hasSkipResolved = false;

    await act(async () => {
      void result.current.handleSkip().then(() => {
        hasSkipResolved = true;
      });
    });

    expect(mockWaitForCompanyEnrichmentSettlement).toHaveBeenCalled();
    expect(hasSkipResolved).toBe(false);
    expect(mockSetNextOnboardingStatus).not.toHaveBeenCalled();

    await act(async () => {
      resolveCompanyEnrichmentSettlement();
    });

    expect(hasSkipResolved).toBe(true);
    expect(mockSetNextOnboardingStatus).toHaveBeenCalled();
  });

  it('should start waiting for the enrichment before the invitation resolves', async () => {
    let resolveInvitation: (value: unknown) => void = () => {};

    mockSendInvitation.mockReturnValue(
      new Promise((resolve) => {
        resolveInvitation = resolve;
      }),
    );

    const { result } = renderInviteTeam();

    act(() => {
      void result.current.handleSkip();
    });

    expect(mockWaitForCompanyEnrichmentSettlement).toHaveBeenCalled();
    expect(mockSetNextOnboardingStatus).not.toHaveBeenCalled();

    await act(async () => {
      resolveInvitation({});
    });
  });

  it('should disable the form while the submission is still in flight', async () => {
    let resolveInvitation: (value: unknown) => void = () => {};

    mockSendInvitation.mockReturnValue(
      new Promise((resolve) => {
        resolveInvitation = resolve;
      }),
    );

    const { result } = renderInviteTeam();

    act(() => {
      void result.current.handleSkip();
    });

    expect(result.current.isNavigating).toBe(true);

    await act(async () => {
      resolveInvitation({});
    });
  });

  it('should stay disabled after advancing', async () => {
    const { result } = renderInviteTeam();

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(result.current.isNavigating).toBe(true);
  });

  it('should re-enable submission when sending the invitations fails', async () => {
    mockSendInvitation.mockResolvedValue({ error: new Error('network error') });

    const { result } = renderInviteTeam();

    await act(async () => {
      await expect(result.current.handleSkip()).rejects.toThrow(
        'network error',
      );
    });

    expect(result.current.isNavigating).toBe(false);
    expect(mockSetNextOnboardingStatus).not.toHaveBeenCalled();
  });

  it('should credit the sent invites up to the maximum rewarded invites', async () => {
    jotaiStore.set(onboardingConfigState.atom, {
      importContactsCreditsReward: 1,
      inviteTeamCreditsRewardPerUser: 0.5,
      installAppsCreditsReward: 0.5,
      createProfileCreditsReward: 0.5,
      upgradeCreditsReward: 2,
      inviteTeamMaxInvites: 2,
    });
    jotaiStore.set(onboardingInviteTeamEmailsDraftState.atom, [
      'grace@example.com',
      'alan@example.com',
      'ada@example.com',
      '',
    ]);
    mockSendInvitation.mockResolvedValue({
      data: { sendInvitations: { result: [{}, {}, {}] } },
    });

    const { result } = renderInviteTeam();

    act(() => {
      result.current.handleInvite();
    });

    await waitFor(() => expect(mockSetNextOnboardingStatus).toHaveBeenCalled());
    expect(jotaiStore.get(onboardingFreeCreditsState.atom).inviteTeam).toBe(1);
  });

  it('should drop the typed invite emails and their credits on skip', async () => {
    jotaiStore.set(onboardingInviteTeamEmailsDraftState.atom, [
      'grace@example.com',
      '',
    ]);
    jotaiStore.set(onboardingFreeCreditsState.atom, {
      ...jotaiStore.get(onboardingFreeCreditsState.atom),
      inviteTeam: 0.5,
    });

    const { result } = renderInviteTeam();

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(jotaiStore.get(onboardingFreeCreditsState.atom).inviteTeam).toBe(0);
    expect(
      jotaiStore.get(onboardingInviteTeamEmailsDraftState.atom),
    ).toBeNull();
  });
});
