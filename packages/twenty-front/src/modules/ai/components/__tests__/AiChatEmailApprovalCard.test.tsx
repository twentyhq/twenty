import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { AiChatEmailApprovalCard } from '@/ai/components/AiChatEmailApprovalCard';

const answerAgentChatToolCall = jest.fn();
jest.mock('@/ai/hooks/useAnswerAgentChatToolCall', () => ({
  useAnswerAgentChatToolCall: () => ({ answerAgentChatToolCall }),
}));

const EMAIL = {
  recipients: { to: 'tim@apple.dev', cc: 'jony@apple.dev', bcc: '' },
  subject: 'Your renewal',
  body: 'Hi Tim,\nYour plan renews next week.',
  connectedAccountId: 'connected-account-id',
};

const renderCard = () =>
  render(
    <I18nProvider i18n={i18n}>
      <Provider store={createStore()}>
        <AiChatEmailApprovalCard toolCallId="call-1" email={EMAIL} />
      </Provider>
    </I18nProvider>,
  );

describe('AiChatEmailApprovalCard', () => {
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
    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: {
        decision: 'send',
        email: { ...EMAIL, subject: 'Renewal confirmed' },
      },
      optimisticToolOutput: undefined,
    });
    // Nothing else can be decided while the answer is on its way.
    expect(
      screen.getByRole('button', { name: 'Save as draft' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Discard' })).toBeDisabled();
  });

  it('saves a draft to the recipients the person chose', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard();

    await user.click(
      screen.getByRole('button', { name: 'Remove tim@apple.dev' }),
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Add a recipient to To' }),
      'Phil Schiller <phil@apple.dev>{Enter}',
    );
    await user.click(screen.getByRole('button', { name: 'Save as draft' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith(
      expect.objectContaining({
        response: {
          decision: 'saveDraft',
          email: {
            ...EMAIL,
            recipients: {
              to: 'phil@apple.dev',
              cc: 'jony@apple.dev',
              bcc: '',
            },
          },
        },
      }),
    );
  });

  it('lets the person add a Bcc the draft did not have', async () => {
    const user = userEvent.setup();

    renderCard();

    expect(
      screen.queryByRole('textbox', { name: 'Add a recipient to Bcc' }),
    ).toBeNull();
    expect(screen.queryByRole('button', { name: 'Cc' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Bcc' }));

    expect(
      screen.getByRole('textbox', { name: 'Add a recipient to Bcc' }),
    ).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Bcc' })).toBeNull();
  });

  it('cannot send once every recipient is removed', async () => {
    const user = userEvent.setup();

    renderCard();

    await user.click(
      screen.getByRole('button', { name: 'Remove tim@apple.dev' }),
    );

    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Save as draft' }),
    ).not.toBeDisabled();
  });

  it('discards the email without sending it, and shows it discarded right away', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(true);

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Discard' }));

    expect(answerAgentChatToolCall).toHaveBeenCalledWith({
      toolCallId: 'call-1',
      response: { decision: 'discard' },
      optimisticToolOutput: {
        success: true,
        result: { status: 'discarded', email: EMAIL },
      },
    });
  });

  it('lets the person decide again when the answer is refused', async () => {
    const user = userEvent.setup();
    answerAgentChatToolCall.mockResolvedValue(false);

    renderCard();

    await user.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Send' })).not.toBeDisabled(),
    );
    expect(screen.getByRole('button', { name: 'Discard' })).not.toBeDisabled();
  });
});
