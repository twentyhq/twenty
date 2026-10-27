import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserCreditsExhaustedBanner } from '@/ai/components/AiChatUserCreditsExhaustedBanner';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  GetAiChatUsageDocument,
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

const renderBanner = (
  userCreditsFallback: UserCreditsFallback = UserCreditsFallback.WORKSPACE_CREDITS,
) => {
  const store = createStore();

  store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
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
          <AiChatUserCreditsExhaustedBanner />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );
};

describe('AiChatUserCreditsExhaustedBanner', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each([
    [
      UserCreditsFallback.WORKSPACE_CREDITS,
      'Personal usage limit reached. Using workspace credits until it resets in 3 days.',
    ],
    [
      UserCreditsFallback.STOP,
      'Personal usage limit reached. Chats resume in 3 days.',
    ],
  ])(
    'tells the member what happens until renewal with fallback %s',
    async (userCreditsFallback, notice) => {
      renderBanner(userCreditsFallback);

      expect(await screen.findByText(notice)).toBeVisible();
    },
  );

  it('stays hidden for the rest of the period once dismissed', async () => {
    renderBanner();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Dismiss' }),
    );

    expect(
      screen.queryByText(/Personal usage limit reached/),
    ).not.toBeInTheDocument();
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

    expect(
      await screen.findByText(
        'Personal usage limit reached. Using workspace credits until it resets in 3 days.',
      ),
    ).toBeVisible();
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

    renderBanner(UserCreditsFallback.STOP);

    expect(
      await screen.findByText(
        'Personal usage limit reached. Chats resume in 3 days.',
      ),
    ).toBeVisible();
  });
});
