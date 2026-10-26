import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatUserCreditsExhaustedBanner } from '@/ai/components/AiChatUserCreditsExhaustedBanner';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import {
  GetAiChatUserCreditsUsageDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const PERIOD_END = '2026-10-26T00:00:00.000Z';

const renderBanner = ({
  consumedValue,
  userCreditsFallback = UserCreditsFallback.WORKSPACE_CREDITS,
}: {
  consumedValue: number;
  userCreditsFallback?: UserCreditsFallback;
}) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    id: 'workspace',
    billingCustomer: {
      id: 'billing-customer',
      hasUserCredits: true,
      userCreditsFallback,
    },
  } as CurrentWorkspace);

  render(
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUserCreditsUsageDocument },
            result: {
              data: {
                aiChatUserCreditsUsage: {
                  __typename: 'AiChatUserCreditsUsage',
                  limitValue: 4160000,
                  consumedValue,
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
    jest.useFakeTimers({
      now: new Date('2026-10-23T12:00:00Z'),
      doNotFake: ['setTimeout', 'queueMicrotask', 'nextTick', 'setImmediate'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    [
      UserCreditsFallback.WORKSPACE_CREDITS,
      'You have used all your AI credits. Chats use workspace credits until yours renew in 3 days.',
    ],
    [
      UserCreditsFallback.STOP,
      'You have used all your AI credits. Chats stop until yours renew in 3 days.',
    ],
  ])(
    'tells the member what happens until renewal with fallback %s',
    async (userCreditsFallback, notice) => {
      renderBanner({ consumedValue: 4160000, userCreditsFallback });

      expect(await screen.findByText(notice)).toBeVisible();
    },
  );

  it('stays hidden for the rest of the period once dismissed', async () => {
    renderBanner({ consumedValue: 4160000 });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Dismiss' }),
    );

    expect(screen.queryByText(/AI credits/)).not.toBeInTheDocument();
    expect(
      JSON.parse(
        localStorage.getItem(
          'ai/agentChatUserCreditsBannerDismissedPeriodEnd',
        ) ?? 'null',
      ),
    ).toBe(PERIOD_END);
  });
});
