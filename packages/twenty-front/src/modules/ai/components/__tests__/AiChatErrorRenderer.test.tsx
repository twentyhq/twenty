import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { AiChatErrorRenderer } from '@/ai/components/AiChatErrorRenderer';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { setAiChatIncludedModelWorkspace } from '@/ai/testing/setAiChatIncludedModelWorkspace';
import { type AiChatError } from '@/ai/types/AiChatError';
import { AiChatErrorCode } from '@/ai/utils/aiChatErrorCode';
import { createAiChatCodedError } from '@/ai/utils/createAiChatCodedError';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { AiModelTier } from '~/generated-metadata/graphql';

jest.mock('@/ai/hooks/useRetryChatMessage', () => ({
  useRetryChatMessage: () => ({ retryChatMessage: jest.fn() }),
}));
jest.mock('@/ai/hooks/useCanRetryCurrentAiChatTurn', () => ({
  useCanRetryCurrentAiChatTurn: () => true,
}));
jest.mock('@/settings/billing/hooks/useManageUsageLimitsButton', () => ({
  useManageUsageLimitsButton: () => ({
    title: 'Manage limits',
    onClick: jest.fn(),
  }),
}));

const buildGraphqlError = (extensions: Record<string, unknown>) =>
  new CombinedGraphQLErrors({
    data: null,
    errors: [{ message: 'Refused', extensions }],
  });

const renderError = (error: AiChatError) =>
  render(
    <JotaiProvider store={jotaiStore}>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'aiChatErrorRendererTest' }}
      >
        <I18nProvider i18n={i18n}>
          <AiChatErrorRenderer error={error} />
        </I18nProvider>
      </AgentChatComponentInstanceContext.Provider>
    </JotaiProvider>,
  );

const CREDITS_EXHAUSTED_MID_TURN_ERROR = createAiChatCodedError(
  'Chat stopped: no more available credits.',
  AiChatErrorCode.CREDITS_EXHAUSTED,
);

describe('AiChatErrorRenderer', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('tells the member a reply cut off by the allowance continues on the included model', () => {
    setAiChatIncludedModelWorkspace(jotaiStore, {
      workspaceTier: AiModelTier.smart,
      hasReachedCreditsCap: true,
    });

    renderError(CREDITS_EXHAUSTED_MID_TURN_ERROR);

    expect(
      screen.getByText('Out of credits: your next messages use GPT-5.6 Luna.'),
    ).toBeInTheDocument();
  });

  it('leaves a reply cut off by the allowance to the no credits banner without the included model', () => {
    setAiChatIncludedModelWorkspace(jotaiStore, {
      isEntitled: false,
      workspaceTier: AiModelTier.smart,
      hasReachedCreditsCap: true,
    });

    renderError(CREDITS_EXHAUSTED_MID_TURN_ERROR);

    expect(screen.queryByText(/Out of credits/)).not.toBeInTheDocument();
  });

  it.each([
    [
      'a refused send',
      buildGraphqlError({
        code: 'QUOTA_EXHAUSTED',
        subCode: 'INCLUDED_CHAT_PAUSED',
      }),
    ],
    [
      'a turn the worker paused',
      createAiChatCodedError(
        'Included chat paused: the workspace reached its daily fair-use limit.',
        AiChatErrorCode.INCLUDED_CHAT_PAUSED,
      ),
    ],
  ])(
    'tells the member included chat is paused after %s, with no retry or limits to manage',
    (_, error) => {
      renderError(error);

      expect(screen.getByText('Included chat paused')).toBeInTheDocument();
      expect(screen.getByText(/It resumes at/)).toBeInTheDocument();
      expect(
        screen.getByText(
          'Pick another model to keep chatting with your credits.',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    },
  );

  it('still offers to manage limits when a usage limit refuses the send', () => {
    renderError(
      buildGraphqlError({ code: 'QUOTA_EXHAUSTED', exhaustedKind: 'limit' }),
    );

    expect(
      screen.getByRole('button', { name: 'Manage limits' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Included chat paused')).not.toBeInTheDocument();
  });

  it('offers a retry for an error the turn can recover from', () => {
    renderError(new Error('Provider timed out'));

    expect(screen.getByText('Failed to get response')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });
});
