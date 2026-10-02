import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import {
  type AskQuestionItem,
  type ProposedEmail,
  type RequestFormField,
} from 'twenty-shared/ai';

import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { type AgentChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

const useAgentChatPendingToolCalls = jest.fn();
jest.mock('@/ai/hooks/useAgentChatPendingToolCalls', () => ({
  useAgentChatPendingToolCalls: () => useAgentChatPendingToolCalls(),
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
jest.mock('@/ai/components/AiChatFormCard', () => ({
  AiChatFormCard: ({ fields }: { fields: RequestFormField[] }) => (
    <div role="group" aria-label="Form">
      {fields[0].label}
    </div>
  ),
}));
jest.mock('@/ai/components/AiChatToolCallApprovalCard', () => ({
  AiChatToolCallApprovalCard: () => (
    <div role="group" aria-label="Tool call approval" />
  ),
}));
jest.mock('@/ai/components/AiChatEmailApprovalCard', () => ({
  AiChatEmailApprovalCard: ({ email }: { email: ProposedEmail }) => (
    <div role="group" aria-label="Email approval">
      {email.subject}
    </div>
  ),
}));

const QUESTIONS: AskQuestionItem[] = [
  {
    header: 'Plan',
    question: 'Which plan?',
    options: [{ label: 'Pro' }, { label: 'Team' }],
  },
];

const EMAIL_APPROVAL = {
  toolCallId: 'call-2',
  kind: 'emailApproval',
  email: {
    recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
    subject: 'Your renewal',
    body: 'Hi Tim',
  },
};

const renderGate = () =>
  render(
    <I18nProvider i18n={i18n}>
      <AiChatPendingAskGate>
        <textarea aria-label="Message" />
      </AiChatPendingAskGate>
    </I18nProvider>,
  );

describe('AiChatPendingAskGate', () => {
  it('shows the questions the thread waits on in place of the composer', () => {
    useAgentChatPendingToolCalls.mockReturnValue([
      { toolCallId: 'call-1', kind: 'questions', questions: QUESTIONS },
    ]);

    renderGate();

    expect(screen.getByRole('group', { name: 'Questions' })).toHaveTextContent(
      'Which plan?',
    );
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows an email waiting for approval in place of the composer', () => {
    useAgentChatPendingToolCalls.mockReturnValue([EMAIL_APPROVAL]);

    renderGate();

    expect(
      screen.getByRole('group', { name: 'Email approval' }),
    ).toHaveTextContent('Your renewal');
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows a form to fill in place of the composer', () => {
    useAgentChatPendingToolCalls.mockReturnValue([
      {
        toolCallId: 'call-4',
        kind: 'form',
        fields: [{ name: 'closeDate', label: 'Close date', type: 'DATE' }],
      },
    ]);

    renderGate();

    expect(screen.getByRole('group', { name: 'Form' })).toHaveTextContent(
      'Close date',
    );
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows the oldest of several requests first and says how many wait', () => {
    useAgentChatPendingToolCalls.mockReturnValue([
      EMAIL_APPROVAL,
      { toolCallId: 'call-3', kind: 'questions', questions: QUESTIONS },
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
    useAgentChatPendingToolCalls.mockReturnValue([]);

    renderGate();

    expect(screen.getByRole('textbox', { name: 'Message' })).toBeVisible();
    expect(screen.queryByRole('group')).toBeNull();
  });
});
