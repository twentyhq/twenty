import { render, screen } from '@testing-library/react';
import { type AskQuestionItem } from 'twenty-shared/ai';

import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

const useAgentChatPendingAsk = jest.fn();
jest.mock('@/ai/hooks/useAgentChatPendingAsk', () => ({
  useAgentChatPendingAsk: (args: { threadId: string }) =>
    useAgentChatPendingAsk(args),
}));
jest.mock('@/ai/components/AiChatQuestionCard', () => ({
  AiChatQuestionCard: ({
    pendingQuestion,
  }: {
    pendingQuestion: AgentChatPendingQuestion;
  }) => (
    <div role="group" aria-label="Questions">
      {pendingQuestion.questions[0].question}
    </div>
  ),
}));
jest.mock('@/ai/components/AiChatFormFieldsAskCard', () => ({
  AiChatFormFieldsAskCard: () => <div role="group" aria-label="Form" />,
}));

const QUESTIONS: AskQuestionItem[] = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

const renderGate = () =>
  render(
    <AiChatPendingAskGate threadId="thread-id">
      <textarea aria-label="Message" />
    </AiChatPendingAskGate>,
  );

describe('AiChatPendingAskGate', () => {
  it('shows the questions the thread waits on in place of the composer', () => {
    useAgentChatPendingAsk.mockReturnValue({
      id: 'ask-1',
      toolCallId: 'call-1',
      form: { kind: 'questions', questions: QUESTIONS },
    });

    renderGate();

    expect(useAgentChatPendingAsk).toHaveBeenCalledWith({
      threadId: 'thread-id',
    });
    expect(screen.getByRole('group', { name: 'Questions' })).toHaveTextContent(
      'Which plan?',
    );
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows the composer once nothing is pending', () => {
    useAgentChatPendingAsk.mockReturnValue(null);

    renderGate();

    expect(screen.getByRole('textbox', { name: 'Message' })).toBeVisible();
    expect(screen.queryByRole('group')).toBeNull();
  });
});
