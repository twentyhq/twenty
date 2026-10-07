import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { type AskQuestionItem } from 'twenty-shared/ai';

import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';

const answerAgentChatToolCall = jest.fn();
jest.mock('@/ai/hooks/useAnswerAgentChatToolCall', () => ({
  useAnswerAgentChatToolCall: () => ({ answerAgentChatToolCall }),
}));

// chips in question text need workspace records, and the composer row needs the model catalog
jest.mock('@/ai/components/TextWithChatReferences', () => ({
  TextWithChatReferences: ({ text }: { text: string }) => text,
}));
jest.mock('@/ai/components/internal/AiChatComposerActionsRow', () => ({
  AiChatComposerActionsRow: ({ sendButton }: { sendButton: ReactNode }) =>
    sendButton,
}));

const SINGLE_SELECT_QUESTION: AskQuestionItem = {
  header: 'Plan',
  question: 'Which plan should we propose?',
  options: [{ label: 'Pro' }, { label: 'Organization' }],
};

const MULTI_SELECT_QUESTION: AskQuestionItem = {
  header: 'Channels',
  question: 'Which channels should the campaign use?',
  allowMultiSelect: true,
  options: [{ label: 'Email' }, { label: 'LinkedIn' }],
};

const renderCard = (question: AskQuestionItem) =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <AiChatQuestionCard
          pendingQuestion={{ toolCallId: 'call-1', kind: 'question', question }}
        />
      </Provider>
    </I18nProvider>,
  );

describe('AiChatQuestionCard', () => {
  beforeEach(() => {
    answerAgentChatToolCall.mockReset();
  });

  it('answers a single-select question as soon as an option is picked', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard(SINGLE_SELECT_QUESTION);

    await user.click(screen.getByRole('button', { name: /Organization/ }));

    expect(answerAgentChatToolCall).toHaveBeenCalledTimes(1);
    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: { selectedOptionIndices: [1] },
      optimisticToolOutput: {
        success: true,
        result: {
          question: SINGLE_SELECT_QUESTION,
          status: 'answered',
          answer: { selectedOptionIndices: [1] },
        },
      },
    });
  });

  it('sends the picked options with the trimmed text typed as another answer', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard(MULTI_SELECT_QUESTION);

    await user.click(screen.getByRole('button', { name: /Email/ }));
    await user.type(
      screen.getByPlaceholderText('Type your own answer here'),
      '  Carrier pigeon  ',
    );
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledTimes(1);
    expect(answerAgentChatToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        toolCallId: 'call-1',
        response: { selectedOptionIndices: [0], freeText: 'Carrier pigeon' },
      }),
    );
  });

  it('can be answered again when the answer is not recorded', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValueOnce(false);
    answerAgentChatToolCall.mockResolvedValueOnce(true);

    renderCard(SINGLE_SELECT_QUESTION);

    await user.click(screen.getByRole('button', { name: /Pro/ }));
    await user.click(screen.getByRole('button', { name: /Pro/ }));

    expect(answerAgentChatToolCall).toHaveBeenCalledTimes(2);
  });
});
