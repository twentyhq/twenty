import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type AskQuestionItem,
  type ProposedToolCall,
  type RequestFormField,
} from 'twenty-shared/ai';

import { AiChatPendingAskGate } from '@/ai/components/AiChatPendingAskGate';
import { type AiChatPendingQuestion } from '@/ai/types/AgentChatPendingQuestion';

const useAiChatPendingToolCalls = jest.fn();
let displayedThreadId = 'thread-1';
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => displayedThreadId,
}));
jest.mock('@/ai/hooks/useAgentChatPendingToolCalls', () => ({
  useAiChatPendingToolCalls: () => useAiChatPendingToolCalls(),
}));
jest.mock('@/ai/components/AiChatQuestionCard', () => ({
  AiChatQuestionCard: ({
    pendingQuestion,
  }: {
    pendingQuestion: AiChatPendingQuestion;
  }) => (
    <div role="group" aria-label="Questions">
      {pendingQuestion.kind === 'question'
        ? pendingQuestion.question.question
        : pendingQuestion.questions[0].question}
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
  AiChatToolCallApprovalCard: ({
    proposal,
  }: {
    proposal: ProposedToolCall;
  }) => (
    <div role="group" aria-label="Tool call approval">
      {proposal.summary}
    </div>
  ),
}));

const QUESTION: AskQuestionItem = {
  header: 'Plan',
  question: 'Which plan?',
  options: [{ label: 'Pro' }, { label: 'Team' }],
};

const EMAIL_APPROVAL = {
  toolCallId: 'call-2',
  kind: 'toolCallApproval',
  proposal: {
    toolName: 'send_email',
    toolLabel: 'Send Email',
    summary: 'Your renewal',
    arguments: {},
    template: 'email',
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
  afterEach(() => {
    displayedThreadId = 'thread-1';
  });

  it('shows the question the thread waits on in place of the composer', () => {
    useAiChatPendingToolCalls.mockReturnValue([
      { toolCallId: 'call-1', kind: 'question', question: QUESTION },
    ]);

    renderGate();

    expect(screen.getByRole('group', { name: 'Questions' })).toHaveTextContent(
      'Which plan?',
    );
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows an email waiting for approval in place of the composer', () => {
    useAiChatPendingToolCalls.mockReturnValue([EMAIL_APPROVAL]);

    renderGate();

    expect(
      screen.getByRole('group', { name: 'Tool call approval' }),
    ).toHaveTextContent('Your renewal');
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows a form to fill in place of the composer', () => {
    useAiChatPendingToolCalls.mockReturnValue([
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

  it('steps through several requests, starting with the oldest', async () => {
    useAiChatPendingToolCalls.mockReturnValue([
      EMAIL_APPROVAL,
      { toolCallId: 'call-3', kind: 'question', question: QUESTION },
    ]);

    renderGate();

    expect(screen.getByText('Request 1 of 2')).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Tool call approval' }),
    ).toBeVisible();
    expect(screen.queryByRole('group', { name: 'Questions' })).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Previous request' }),
    ).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Next request' }));

    expect(screen.getByText('Request 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Questions' })).toBeVisible();
    expect(
      screen.queryByRole('group', { name: 'Tool call approval' }),
    ).toBeNull();
    expect(screen.queryByRole('textbox', { name: 'Message' })).toBeNull();
  });

  it('shows the request that took the place of an answered one', async () => {
    const formRequest = {
      toolCallId: 'call-4',
      kind: 'form',
      fields: [{ name: 'closeDate', label: 'Close date', type: 'DATE' }],
    };

    useAiChatPendingToolCalls.mockReturnValue([
      EMAIL_APPROVAL,
      { toolCallId: 'call-3', kind: 'question', question: QUESTION },
      formRequest,
    ]);

    const { rerender } = renderGate();

    await userEvent.click(screen.getByRole('button', { name: 'Next request' }));
    useAiChatPendingToolCalls.mockReturnValue([EMAIL_APPROVAL, formRequest]);
    rerender(
      <I18nProvider i18n={i18n}>
        <AiChatPendingAskGate>
          <textarea aria-label="Message" />
        </AiChatPendingAskGate>
      </I18nProvider>,
    );

    expect(screen.getByText('Request 2 of 2')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Form' })).toBeVisible();
  });

  it('opens another conversation on its oldest request', async () => {
    useAiChatPendingToolCalls.mockReturnValue([
      EMAIL_APPROVAL,
      { toolCallId: 'call-3', kind: 'question', question: QUESTION },
    ]);

    const { rerender } = renderGate();

    await userEvent.click(screen.getByRole('button', { name: 'Next request' }));

    displayedThreadId = 'thread-2';
    useAiChatPendingToolCalls.mockReturnValue([
      { toolCallId: 'call-5', kind: 'question', question: QUESTION },
      EMAIL_APPROVAL,
    ]);
    rerender(
      <I18nProvider i18n={i18n}>
        <AiChatPendingAskGate>
          <textarea aria-label="Message" />
        </AiChatPendingAskGate>
      </I18nProvider>,
    );

    expect(screen.getByText('Request 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Questions' })).toBeVisible();
  });

  it('opens a later batch of requests on its oldest one', async () => {
    useAiChatPendingToolCalls.mockReturnValue([
      EMAIL_APPROVAL,
      { toolCallId: 'call-3', kind: 'question', question: QUESTION },
    ]);

    const { rerender } = renderGate();
    const rerenderGate = () =>
      rerender(
        <I18nProvider i18n={i18n}>
          <AiChatPendingAskGate>
            <textarea aria-label="Message" />
          </AiChatPendingAskGate>
        </I18nProvider>,
      );

    await userEvent.click(screen.getByRole('button', { name: 'Next request' }));
    useAiChatPendingToolCalls.mockReturnValue([]);
    rerenderGate();
    useAiChatPendingToolCalls.mockReturnValue([
      { toolCallId: 'call-6', kind: 'question', question: QUESTION },
      { ...EMAIL_APPROVAL, toolCallId: 'call-7' },
    ]);
    rerenderGate();

    expect(screen.getByText('Request 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Questions' })).toBeVisible();
  });

  it('shows the composer once nothing is pending', () => {
    useAiChatPendingToolCalls.mockReturnValue([]);

    renderGate();

    expect(screen.getByRole('textbox', { name: 'Message' })).toBeVisible();
    expect(screen.queryByRole('group')).toBeNull();
  });
});
