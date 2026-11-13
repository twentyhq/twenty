import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserCreditsExhaustedBanner } from '@/ai/components/AiChatUserCreditsExhaustedBanner';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  GetAiChatUsageDocument,
  PermissionFlagType,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import {
  mockCurrentWorkspace,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const PERIOD_END = new Date(Date.now() + 3 * 86400000).toISOString();

const FALLBACK_NOTICE =
  'Weekly personal AI limit reached. Now using workspace credits.';
const ADMIN_STOP_NOTICE =
  'Weekly personal AI limit reached. Enable workspace credits to continue.';
const MEMBER_STOP_NOTICE =
  'Weekly personal AI limit reached. Ask an admin to enable workspace credits.';

const renderBanner = ({
  userCreditsFallback = UserCreditsFallback.WORKSPACE_CREDITS,
  hasBillingPermission = false,
}: {
  userCreditsFallback?: UserCreditsFallback;
  hasBillingPermission?: boolean;
} = {}) => {
  const store = createStore();

  store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
  store.set(currentUserWorkspaceState.atom, {
    permissionFlags: hasBillingPermission ? [PermissionFlagType.BILLING] : [],
    twoFactorAuthenticationMethodSummary: [],
    objectRecordsPermissions: [],
    isImpersonating: false,
  });
  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    billingCustomer: {
      id: 'billing-customer',
      userCreditsFallback,
    },
  });

  render(
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUsageDocument },
            result: {
              data: {
                aiChatUsage: null,
                aiChatUserCreditsUsage: {
                  __typename: 'AiChatUserCreditsUsage',
                  limitValue: 4160000,
                  consumedValue: 4160000,
                  periodEnd: PERIOD_END,
                },
              },
            },
          },
        ]}
      >
        <I18nProvider i18n={i18n}>
          <MemoryRouter initialEntries={['/objects/companies']}>
            <Routes>
              <Route
                path="/objects/companies"
                element={<AiChatUserCreditsExhaustedBanner />}
              />
              <Route path="/settings/billing" element={<>Billing settings</>} />
            </Routes>
          </MemoryRouter>
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );
};

describe('AiChatUserCreditsExhaustedBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('tells the member their personal limit is reached and workspace credits are used', async () => {
    renderBanner();

    expect(await screen.findByText(FALLBACK_NOTICE)).toBeVisible();
  });

  it('sends a billing admin to settings when chats stop', async () => {
    renderBanner({
      userCreditsFallback: UserCreditsFallback.STOP,
      hasBillingPermission: true,
    });

    expect(await screen.findByText(ADMIN_STOP_NOTICE)).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Settings' }));

    expect(await screen.findByText('Billing settings')).toBeVisible();
  });

  it('asks a member without billing access to contact an admin when chats stop', async () => {
    renderBanner({ userCreditsFallback: UserCreditsFallback.STOP });

    expect(await screen.findByText(MEMBER_STOP_NOTICE)).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Settings' }),
    ).not.toBeInTheDocument();
  });

  it('stays hidden for the rest of the period once dismissed', async () => {
    renderBanner();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Dismiss' }),
    );

    expect(screen.queryByText(FALLBACK_NOTICE)).not.toBeInTheDocument();
    expect(
      JSON.parse(
        localStorage.getItem('ai/agentChatUserCreditsBannerDismissal') ??
          'null',
      ),
    ).toEqual({
      workspaceMemberId: mockedWorkspaceMemberData.id,
      periodEnd: PERIOD_END,
      isFallingBackToWorkspaceCredits: true,
    });
  });

  it('shows the notice to a member who did not dismiss it in this browser', async () => {
    localStorage.setItem(
      'ai/agentChatUserCreditsBannerDismissal',
      JSON.stringify({
        workspaceMemberId: 'another-workspace-member-id',
        periodEnd: PERIOD_END,
        isFallingBackToWorkspaceCredits: true,
      }),
    );

    renderBanner();

    expect(await screen.findByText(FALLBACK_NOTICE)).toBeVisible();
  });

  it('shows the stop notice when chats stop after the fallback notice was dismissed', async () => {
    localStorage.setItem(
      'ai/agentChatUserCreditsBannerDismissal',
      JSON.stringify({
        workspaceMemberId: mockedWorkspaceMemberData.id,
        periodEnd: PERIOD_END,
        isFallingBackToWorkspaceCredits: true,
      }),
    );

    renderBanner({ userCreditsFallback: UserCreditsFallback.STOP });

    expect(await screen.findByText(MEMBER_STOP_NOTICE)).toBeVisible();
  });
});
