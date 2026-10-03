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

jest.mock(
  '@/ai/components/internal/AiChatToolCallApprovalArgumentsCard',
  () => ({ AiChatToolCallApprovalArgumentsCard: () => null }),
);
jest.mock(
  '@/activities/emails/editor/constants/InlineEmailBodyEditorProfile',
  () => ({ INLINE_EMAIL_BODY_EDITOR_PROFILE: {} }),
);

// the rich editor is replaced by a textarea that writes its text as a one-paragraph document
jest.mock(
  '@/advanced-text-editor/components/FormAdvancedTextFieldInput',
  () => ({
    FormAdvancedTextFieldInput: ({
      onChange,
    }: {
      onChange: (value: string) => void;
    }) => (
      <textarea
        aria-label="Email body"
        onChange={(event) =>
          onChange(
            JSON.stringify({
              type: 'doc',
              attrs: { schemaVersion: 1 },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: event.target.value }],
                },
              ],
            }),
          )
        }
      />
    ),
  }),
);

const BODY = {
  type: 'doc',
  attrs: { schemaVersion: 1 },
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi Tim' }] }],
};

const EMAIL_ARGUMENTS = {
  recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
  subject: 'Your renewal',
  body: BODY,
  connectedAccountId: 'connected-account-id',
};

const PROPOSAL: ProposedToolCall = {
  toolName: 'send_email',
  toolLabel: 'Send email',
  summary: 'Follow up on the renewal',
  arguments: EMAIL_ARGUMENTS,
  template: 'email',
  alternativeToolNames: ['draft_email'],
};

const renderCard = (proposal: ProposedToolCall = PROPOSAL) =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <AiChatToolCallApprovalCard toolCallId="call-1" proposal={proposal} />
      </Provider>
    </I18nProvider>,
  );

describe('AiChatToolCallApprovalCard for an email', () => {
  beforeEach(() => {
    answerAgentChatToolCall.mockReset();
  });

  it('sends the email as the person edited it', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockReturnValue(new Promise(() => {}));

    renderCard();

    const subject = screen.getByRole('textbox', { name: 'Subject' });
    await user.clear(subject);
    await user.type(subject, 'Renewal confirmed');
    fireEvent.change(screen.getByRole('textbox', { name: 'Email body' }), {
      target: { value: 'Hi Tim, all set.' },
    });
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: {
        decision: 'approve',
        toolName: 'send_email',
        arguments: {
          ...EMAIL_ARGUMENTS,
          subject: 'Renewal confirmed',
          body: {
            type: 'doc',
            attrs: { schemaVersion: 1 },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Hi Tim, all set.' }],
              },
            ],
          },
        },
      },
      optimisticToolOutput: undefined,
    });
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
  });

  it('saves the email as a draft through the alternative tool', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Save as draft' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        response: {
          decision: 'approve',
          toolName: 'draft_email',
          arguments: EMAIL_ARGUMENTS,
        },
      }),
    );
  });

  it('discards the email with the feedback the person wrote', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Add feedback' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Feedback' }),
      'Too formal',
    );
    await user.click(screen.getByRole('button', { name: 'Discard' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        response: { decision: 'reject', feedback: 'Too formal' },
      }),
    );
  });

  it('cannot send an email without a recipient', async () => {
    const user = userEvent.setup();

    renderCard();

    await user.click(
      screen.getByRole('button', { name: 'Remove tim@apple.dev' }),
    );

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('only offers to save a draft that was proposed without an alternative', () => {
    renderCard({
      ...PROPOSAL,
      toolName: 'draft_email',
      alternativeToolNames: undefined,
    });

    expect(
      screen.getByRole('button', { name: 'Save as draft' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Send' }),
    ).not.toBeInTheDocument();
  });
});
