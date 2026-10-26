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
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  GetAiChatUsageDocument,
  UserCreditsFallback,
} from '~/generated-metadata/graphql';
import { messages } from '~/locales/generated/en';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

i18n.load({ [SOURCE_LOCALE]: messages });
i18n.activate(SOURCE_LOCALE);

jest.mock('@/ai/hooks/useRetryChatMessage', () => ({
  useRetryChatMessage: () => ({ retryChatMessage: jest.fn() }),
}));
jest.mock('@/ai/hooks/useCanRetryCurrentAiChatTurn', () => ({
  useCanRetryCurrentAiChatTurn: () => true,
}));

const USER_CREDITS_STOPPED_TURN_ERROR = createAiChatCodedError(
  'The member ran out of AI credits.',
  AiChatErrorCode.USER_CREDITS_EXHAUSTED,
);

const renderError = ({
  error,
  consumedValue = 830000,
  userCreditsFallback = UserCreditsFallback.STOP,
}: {
  error: AiChatError;
  consumedValue?: number;
  userCreditsFallback?: UserCreditsFallback;
}) => {
  const store = createStore();

  store.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    billingCustomer: { id: 'billing-customer', userCreditsFallback },
  });

  const result = {
    data: {
      aiChatUsage: null,
      aiChatUserCreditsUsage: {
        __typename: 'AiChatUserCreditsUsage',
        limitValue: 830000,
        consumedValue,
        periodEnd: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
    },
  };

  render(
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={[
          {
            request: { query: GetAiChatUsageDocument },
            result,
          },
        ]}
      >
        <I18nProvider i18n={i18n}>
          <AiChatErrorRenderer error={error} />
        </I18nProvider>
      </MockedProvider>
    </JotaiProvider>,
  );
};

describe('AiChatErrorRenderer with spent user credits', () => {
  it('explains a reopened turn that user credits stopped, without a retry', async () => {
    renderError({ error: USER_CREDITS_STOPPED_TURN_ERROR });

    expect(screen.getByText('The member ran out of AI credits.')).toBeVisible();
    expect(
      await screen.findByText('AI credits renew in 3 days.'),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Retry/ }),
    ).not.toBeInTheDocument();
  });

  it('offers a retry without the renewal once credits have renewed', async () => {
    renderError({ error: USER_CREDITS_STOPPED_TURN_ERROR, consumedValue: 0 });

    expect(await screen.findByRole('button', { name: /Retry/ })).toBeVisible();
    expect(screen.queryByText(/renew in/)).not.toBeInTheDocument();
  });

  it('offers a retry once chats fall back to workspace credits', async () => {
    renderError({
      error: USER_CREDITS_STOPPED_TURN_ERROR,
      userCreditsFallback: UserCreditsFallback.WORKSPACE_CREDITS,
    });

    expect(await screen.findByRole('button', { name: /Retry/ })).toBeVisible();
  });

  it('explains a send refused upfront', async () => {
    renderError({
      error: new CombinedGraphQLErrors({
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
    });

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
