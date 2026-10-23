import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import {
  type CurrentWorkspace,
  currentWorkspaceState,
} from '@/auth/states/currentWorkspaceState';
import {
  GetAiChatUsageDocument,
  GetAiChatUserCreditsUsageDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

const renderButton = ({
  consumedUserCredits,
  userCreditsFallback,
}: {
  consumedUserCredits: number;
  userCreditsFallback: UserCreditsFallback;
}) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    billingCustomer: { id: 'billing-customer', userCreditsFallback },
  } as CurrentWorkspace);

  render(
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUsageDocument },
            maxUsageCount: Infinity,
            result: {
              data: {
                aiChatUsage: {
                  __typename: 'AiChatUsage',
                  limitValue: 1000,
                  consumedValue: 200,
                  periodEnd: '2026-11-01T00:00:00.000Z',
                  kind: 'workspaceAllowance',
                },
              },
            },
          },
          {
            request: { query: GetAiChatUserCreditsUsageDocument },
            maxUsageCount: Infinity,
            result: {
              data: {
                aiChatUserCreditsUsage: {
                  __typename: 'AiChatUserCreditsUsage',
                  limitValue: 4160000,
                  consumedValue: consumedUserCredits,
                  periodEnd: '2026-10-26T00:00:00.000Z',
                },
              },
            },
          },
        ]}
      >
        <I18nProvider i18n={i18n}>
          <AiChatContextUsageButton />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );
};

const openUsageCard = () =>
  userEvent.click(screen.getByRole('button', { name: /^Context and usage/ }));

describe('AiChatContextUsageButton', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date('2026-10-23T12:00:00Z'),
      doNotFake: ['setTimeout', 'queueMicrotask', 'nextTick', 'setImmediate'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows personal usage above workspace usage while user credits are left', async () => {
    renderButton({
      consumedUserCredits: 1160000,
      userCreditsFallback: UserCreditsFallback.STOP,
    });

    await openUsageCard();

    expect(
      await screen.findByRole('progressbar', { name: 'Personal usage' }),
    ).toHaveAttribute('aria-valuetext', 'Reset in 3 days (28%)');
    expect(
      await screen.findByRole('progressbar', { name: 'Usage' }),
    ).toBeInTheDocument();
  });

  it('keeps workspace usage once user credits run out when chats fall back to workspace credits', async () => {
    renderButton({
      consumedUserCredits: 4160000,
      userCreditsFallback: UserCreditsFallback.WORKSPACE_CREDITS,
    });

    await openUsageCard();

    expect(
      await screen.findByRole('progressbar', { name: 'Personal usage' }),
    ).toHaveAttribute('aria-valuetext', 'Reset in 3 days (100%)');
    expect(
      screen.getByRole('progressbar', { name: 'Usage' }),
    ).toBeInTheDocument();
  });

  it('hides workspace usage once user credits run out when chats stop', async () => {
    renderButton({
      consumedUserCredits: 4160000,
      userCreditsFallback: UserCreditsFallback.STOP,
    });

    await openUsageCard();

    expect(
      await screen.findByRole('progressbar', { name: 'Personal usage' }),
    ).toHaveAttribute('aria-valuetext', 'Reset in 3 days (100%)');
    expect(
      screen.queryByRole('progressbar', { name: 'Usage' }),
    ).not.toBeInTheDocument();
  });
});
