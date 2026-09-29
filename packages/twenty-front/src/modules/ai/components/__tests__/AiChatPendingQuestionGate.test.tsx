import { render, screen } from '@testing-library/react';

import { AiChatPendingQuestionGate } from '@/ai/components/AiChatPendingQuestionGate';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

const useAgentChatPendingQuestion = jest.fn();
jest.mock('@/ai/hooks/useAgentChatPendingQuestion', () => ({
  useAgentChatPendingQuestion: (args: { threadId: string }) =>
    useAgentChatPendingQuestion(args),
}));
jest.mock('@/ai/components/AiChatQuestionCard', () => ({
  AiChatQuestionCard: ({
    pendingQuestion,
  }: {
    pendingQuestion: AgentChatPendingQuestion;
  }) => <div role="group">{pendingQuestion.questions[0].question}</div>,
}));

const renderGate = () =>
  render(
    <AiChatPendingQuestionGate threadId="thread-id">
      <textarea aria-label="Message" />
    </AiChatPendingQuestionGate>,
  );

describe('AiChatPendingQuestionGate', () => {
  it('shows the question the thread waits on in place of the composer', () => {
    useAgentChatPendingQuestion.mockReturnValue({
      toolCallId: 'call-1',
      questions: [
        {
          header: 'Plan',
          question: 'Which plan?',
          options: [{ label: 'Pro' }, { label: 'Team' }],
        },
      ],
    });

    renderGate();

    expect(useAgentChatPendingQuestion).toHaveBeenCalledWith({
      threadId: 'thread-id',
    });
    expect(screen.getByRole('group')).toHaveTextContent('Which plan?');
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows the composer once nothing is pending', () => {
    useAgentChatPendingQuestion.mockReturnValue(null);

    renderGate();

    expect(screen.getByRole('textbox', { name: 'Message' })).toBeVisible();
    expect(screen.queryByRole('group')).toBeNull();
  });
});
