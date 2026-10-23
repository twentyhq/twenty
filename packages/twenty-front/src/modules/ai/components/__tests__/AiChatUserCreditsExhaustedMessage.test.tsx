import { MockedProvider } from '@apollo/client/testing/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { type AiChatError } from '@/ai/types/AiChatError';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai/utils/createAiChatCodedError';
import { GetAiChatUserCreditsUsageDocument } from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/hooks/useRetryChatMessage', () => ({
  useRetryChatMessage: () => ({ retryChatMessage: jest.fn() }),
}));
jest.mock('@/ai/hooks/useCanRetryCurrentAiChatTurn', () => ({
  useCanRetryCurrentAiChatTurn: () => true,
}));

const renderError = (error: AiChatError) =>
  render(
    <JotaiProvider store={createStore()}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUserCreditsUsageDocument },
            result: {
              data: {
                aiChatUserCreditsUsage: {
                  __typename: 'AiChatUserCreditsUsage',
                  limitValue: 830000,
                  consumedValue: 830000,
                  periodEnd: '2026-10-26T00:00:00.000Z',
                },
              },
            },
          },
        ]}
      >
        <I18nProvider i18n={i18n}>
          <AiChatErrorRenderer error={error} />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );

describe('AiChatErrorRenderer with spent user credits', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date('2026-10-23T12:00:00Z'),
      doNotFake: ['setTimeout', 'queueMicrotask', 'nextTick', 'setImmediate'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('explains a turn stopped mid-stream and when credits renew, without a retry', async () => {
    renderError(
      createAiChatCodedError(
        'You have used all your AI credits.',
        AiChatErrorCode.USER_CREDITS_EXHAUSTED,
      ),
    );

    expect(
      screen.getByText('You have used all your AI credits.'),
    ).toBeVisible();
    expect(
      await screen.findByText('Your credits renew in 3 days.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();
  });

  it('explains a send refused upfront', async () => {
    renderError(
      new CombinedGraphQLErrors({
        data: null,
        errors: [
          {
            message: 'User credits allowance exhausted for this period',
            extensions: {
              code: 'QUOTA_EXHAUSTED',
              exhaustedKind: 'userAllowance',
              userFriendlyMessage:
                'Your AI credits for this period are used up.',
            },
          },
        ],
      }),
    );

    expect(
      screen.getByText('Your AI credits for this period are used up.'),
    ).toBeVisible();
    expect(
      await screen.findByText('Your credits renew in 3 days.'),
    ).toBeVisible();
    expect(
      screen.queryByText('Ask an admin to raise the limit.'),
    ).not.toBeInTheDocument();
  });
});
