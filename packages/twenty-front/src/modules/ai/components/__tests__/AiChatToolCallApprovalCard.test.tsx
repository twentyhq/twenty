import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { type ProposedToolCall } from 'twenty-shared/ai';

import { AiChatToolCallApprovalCard } from '@/ai/components/AiChatToolCallApprovalCard';

const answerAgentChatToolCall = jest.fn();
jest.mock('@/ai/hooks/useAnswerAgentChatToolCall', () => ({
  useAnswerAgentChatToolCall: () => ({ answerAgentChatToolCall }),
}));

// record cards need workspace metadata, which a generic call never reads
jest.mock(
  '@/ai/components/internal/AiChatToolCallApprovalRecordFields',
  () => ({ AiChatToolCallApprovalRecordFields: () => null }),
);
jest.mock('@/ai/components/internal/AiChatToolCallApprovalRecordChip', () => ({
  AiChatToolCallApprovalRecordChip: () => null,
}));

const PROPOSAL: ProposedToolCall = {
  toolName: 'http_request',
  toolLabel: 'HTTP request',
  summary: 'Notify the billing system of the renewal',
  arguments: { url: 'https://billing.example.com', method: 'POST' },
  template: 'generic',
};

const renderCard = () =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <AiChatToolCallApprovalCard toolCallId="call-1" proposal={PROPOSAL} />
      </Provider>
    </I18nProvider>,
  );

describe('AiChatToolCallApprovalCard', () => {
  beforeEach(() => {
    answerAgentChatToolCall.mockReset();
  });

  it('shows what the call does and which tool it runs', () => {
    renderCard();

    expect(screen.getByText(PROPOSAL.summary)).toBeInTheDocument();
    expect(screen.getByText('HTTP request')).toBeInTheDocument();
  });

  it('approves the call with the arguments as the person edited them', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockReturnValue(new Promise(() => {}));

    renderCard();

    fireEvent.change(screen.getByRole('textbox', { name: 'Arguments' }), {
      target: { value: '{"url":"https://billing.example.com","method":"PUT"}' },
    });
    await user.click(screen.getByRole('button', { name: 'Approve' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: {
        decision: 'approve',
        arguments: { url: 'https://billing.example.com', method: 'PUT' },
      },
      optimisticToolOutput: undefined,
    });
    expect(screen.getByRole('button', { name: 'Reject' })).toBeDisabled();
  });

  it('cannot approve arguments that are not a JSON object', () => {
    renderCard();

    fireEvent.change(screen.getByRole('textbox', { name: 'Arguments' }), {
      target: { value: '{"url":' },
    });

    expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
    expect(
      screen.getByText('Arguments must be a valid JSON object.'),
    ).toBeInTheDocument();
  });

  it('rejects the call with the feedback the person wrote', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Add feedback' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Feedback' }),
      'Wait for the signed quote',
    );
    await user.click(screen.getByRole('button', { name: 'Reject' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: { decision: 'reject', feedback: 'Wait for the signed quote' },
      optimisticToolOutput: {
        success: true,
        result: {
          status: 'rejected',
          proposal: PROPOSAL,
          feedback: 'Wait for the signed quote',
        },
      },
    });
  });
});
