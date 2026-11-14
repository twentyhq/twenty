import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AiChatQuestionCard } from '@/ai/components/AiChatQuestionCard';
import { type AiChatPendingQuestion } from '@/ai/types/AiChatPendingQuestion';

const mockAnswerAiChatToolCall = jest.fn();

jest.mock('@/ai/hooks/useAnswerAiChatToolCall', () => ({
  useAnswerAiChatToolCall: () => ({
    answerAiChatToolCall: mockAnswerAiChatToolCall,
  }),
}));
jest.mock('@/ai/components/internal/AiChatContextUsageButton', () => ({
  AiChatContextUsageButton: () => null,
}));

const PENDING_QUESTION: AiChatPendingQuestion = {
  toolCallId: 'call-1',
  kind: 'question',
  question: {
    header: 'Tone',
    question: 'Which tone should the email use?',
    options: [{ label: 'Friendly' }, { label: 'Formal' }],
  },
};

describe('AiChatQuestionCard', () => {
  it('does not send the other answer on the Enter that confirms an IME composition', async () => {
    mockAnswerAiChatToolCall.mockResolvedValue(true);

    render(
      <I18nProvider i18n={i18n}>
        <AiChatQuestionCard pendingQuestion={PENDING_QUESTION} />
      </I18nProvider>,
    );

    const textarea = screen.getByPlaceholderText('Type your own answer here');

    await userEvent.type(textarea, '丁寧に');
    fireEvent.keyDown(textarea, { key: 'Enter', isComposing: true });

    expect(mockAnswerAiChatToolCall).not.toHaveBeenCalled();

    await userEvent.type(textarea, '{Enter}');

    await waitFor(() =>
      expect(mockAnswerAiChatToolCall).toHaveBeenCalledWith(
        expect.objectContaining({
          response: { selectedOptionIndices: [], freeText: '丁寧に' },
        }),
      ),
    );
  });
});
