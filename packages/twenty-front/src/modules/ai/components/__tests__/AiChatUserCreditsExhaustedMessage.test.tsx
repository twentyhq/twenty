import { MockedProvider } from '@apollo/client/testing/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
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

const renderError = (error: AiChatError, consumedValue = 830000) => {
  const resolveUserCreditsUsage = jest.fn(() => ({
    data: {
      aiChatUserCreditsUsage: {
        __typename: 'AiChatUserCreditsUsage',
        limitValue: 830000,
        consumedValue,
        periodEnd: '2026-10-26T00:00:00.000Z',
      },
    },
  }));

  render(
    <JotaiProvider store={createStore()}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUserCreditsUsageDocument },
            result: resolveUserCreditsUsage,
          },
        ]}
      >
        <I18nProvider i18n={i18n}>
          <AiChatErrorRenderer error={error} />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );

  return { resolveUserCreditsUsage };
};

describe('AiChatErrorRenderer with spent user credits', () => {
  beforeEach(() => {
    jest.useFakeTimers({
      now: new Date('2026-10-23T12:00:00Z'),
      doNotFake: [
        'setTimeout',
        'setInterval',
        'queueMicrotask',
        'nextTick',
        'setImmediate',
      ],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('explains a reopened turn that user credits stopped, without a retry', async () => {
    renderError(
      createAiChatCodedError(
        'The member ran out of AI credits.',
        AiChatErrorCode.USER_CREDITS_EXHAUSTED,
      ),
    );

    expect(screen.getByText('The member ran out of AI credits.')).toBeVisible();
    expect(
      await screen.findByText('AI credits renew in 3 days.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Retry' }),
    ).not.toBeInTheDocument();
  });

  it('leaves the renewal out of a reopened turn once credits have renewed', async () => {
    const { resolveUserCreditsUsage } = renderError(
      createAiChatCodedError(
        'The member ran out of AI credits.',
        AiChatErrorCode.USER_CREDITS_EXHAUSTED,
      ),
      0,
    );

    await waitFor(() => expect(resolveUserCreditsUsage).toHaveBeenCalled());
    await act(() => Promise.resolve());

    expect(screen.getByText('The member ran out of AI credits.')).toBeVisible();
    expect(screen.queryByText(/renew in/)).not.toBeInTheDocument();
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
      await screen.findByText('AI credits renew in 3 days.'),
    ).toBeVisible();
    expect(
      screen.queryByText('Ask an admin to raise the limit.'),
    ).not.toBeInTheDocument();
  });
});
