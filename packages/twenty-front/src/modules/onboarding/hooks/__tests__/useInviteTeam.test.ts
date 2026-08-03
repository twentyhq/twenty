import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
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

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueSuccessSnackBar: jest.fn() }),
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
});
