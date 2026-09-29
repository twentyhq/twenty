import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type AskQuestionItem, type ProposedEmail } from 'twenty-shared/ai';

import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

const useAgentChatPendingAsks = jest.fn();
jest.mock('@/ai/hooks/useAgentChatPendingAsks', () => ({
  useAgentChatPendingAsks: (args: { threadId: string }) =>
    useAgentChatPendingAsks(args),
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
jest.mock('@/ai/components/AiChatEmailApprovalCard', () => ({
  AiChatEmailApprovalCard: ({ email }: { email: ProposedEmail }) => (
    <div role="group" aria-label="Email approval">
      {email.subject}
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

const EMAIL_ASK = {
  id: 'ask-2',
  toolCallId: 'call-2',
  form: {
    kind: 'emailApproval',
    email: {
      recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
      subject: 'Your renewal',
      body: 'Hi Tim',
    },
  },
};

const renderGate = () =>
  render(
    <I18nProvider i18n={i18n}>
      <AiChatPendingAskGate threadId="thread-id">
        <textarea aria-label="Message" />
      </AiChatPendingAskGate>
    </I18nProvider>,
  );

describe('AiChatPendingAskGate', () => {
  it('shows the questions the thread waits on in place of the composer', () => {
    useAgentChatPendingAsks.mockReturnValue([
      {
        id: 'ask-1',
        toolCallId: 'call-1',
        form: { kind: 'questions', questions: QUESTIONS },
      },
    ]);

    renderGate();

    expect(useAgentChatPendingAsks).toHaveBeenCalledWith({
      threadId: 'thread-id',
    });
    expect(screen.getByRole('group', { name: 'Questions' })).toHaveTextContent(
      'Which plan?',
    );
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows an email waiting for approval in place of the composer', () => {
    useAgentChatPendingAsks.mockReturnValue([EMAIL_ASK]);

    renderGate();

    expect(
      screen.getByRole('group', { name: 'Email approval' }),
    ).toHaveTextContent('Your renewal');
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows the oldest of several requests first and says how many wait', () => {
    useAgentChatPendingAsks.mockReturnValue([
      EMAIL_ASK,
      {
        id: 'ask-3',
        toolCallId: 'call-3',
        form: { kind: 'questions', questions: QUESTIONS },
      },
    ]);

    renderGate();

    expect(
      screen.getByRole('group', { name: 'Email approval' }),
    ).toHaveTextContent('Your renewal');
    expect(screen.queryByRole('group', { name: 'Questions' })).toBeNull();
    expect(
      screen.getByText('2 requests are waiting on you'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows the composer once nothing is pending', () => {
    useAgentChatPendingAsks.mockReturnValue([]);

    renderGate();

    expect(screen.getByRole('textbox', { name: 'Message' })).toBeVisible();
    expect(screen.queryByRole('group')).toBeNull();
  });
});
