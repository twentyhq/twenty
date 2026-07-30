import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { type WorkspaceCompanyEnrichment } from 'twenty-shared/workspace';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

import { useInviteTeam } from '@/onboarding/hooks/useInviteTeam';
import { companyEnrichmentState } from '@/onboarding/states/companyEnrichmentState';
import { hasSettledCompanyEnrichmentFetchState } from '@/onboarding/states/hasSettledCompanyEnrichmentFetchState';
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

const enrichment: WorkspaceCompanyEnrichment = {
  domain: 'acme.com',
  enrichedAt: '2026-07-21T10:00:00.000Z',
  name: 'Acme Inc',
  website: null,
  industry: null,
  employeeCount: 320,
  size: null,
  founded: null,
  headline: null,
  summary: null,
  tags: [],
  locality: null,
  region: null,
  country: null,
};

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

  // Otherwise a fast lead is treated as unqualified and never sees the booking step.
  it('should wait for the enrichment answer before advancing when it is unresolved', async () => {
    const { result } = renderInviteTeam();

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(mockWaitForCompanyEnrichmentSettlement).toHaveBeenCalled();
    expect(mockSetNextOnboardingStatus).toHaveBeenCalled();
  });

  it.each([
    [
      'an enrichment is already stored',
      () => jotaiStore.set(companyEnrichmentState.atom, enrichment),
    ],
    [
      'the fetch has already settled',
      () => jotaiStore.set(hasSettledCompanyEnrichmentFetchState.atom, true),
    ],
  ])('should not wait when %s', async (_label, seedAnswer) => {
    seedAnswer();

    const { result } = renderInviteTeam();

    await act(async () => {
      await result.current.handleSkip();
    });

    expect(mockWaitForCompanyEnrichmentSettlement).not.toHaveBeenCalled();
    expect(mockSetNextOnboardingStatus).toHaveBeenCalled();
  });

  it('should block a second submission while the first is still advancing', async () => {
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
