import { PROPOSE_EMAIL_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-email.pausing-tool';

const PROPOSED_EMAIL = {
  recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
  subject: 'Your renewal',
  body: 'Hi Tim,\nThanks for renewing.\n\nBest, Jane',
  connectedAccountId: '20202020-9b3e-4c55-8f0b-7c1d2e3f4a5b',
};

const parseCall = () => {
  const call = PROPOSE_EMAIL_PAUSING_TOOL.parseCall(PROPOSED_EMAIL);

  if (call === null) {
    throw new Error('Expected the call to parse');
  }

  return call;
};

const buildContext = (toolOutput: Record<string, unknown>) => ({
  executeTool: jest.fn().mockResolvedValue(toolOutput),
});

describe('PROPOSE_EMAIL_PAUSING_TOOL', () => {
  it.each([
    ['an unknown decision', { decision: 'forward' }],
    [
      'sending without a recipient',
      {
        decision: 'send',
        email: {
          ...PROPOSED_EMAIL,
          recipients: { to: ' ', cc: '', bcc: '' },
        },
      },
    ],
    ['sending without the email', { decision: 'send' }],
  ])('refuses %s', (_description, output) => {
    expect(parseCall().validate(output)).toMatchObject({ isValid: false });
  });

  it('sends the edited email through send_email and says it was sent', async () => {
    const context = buildContext({
      success: true,
      message: 'Email sent successfully to tim@apple.dev',
      result: { messageId: 'message-id' },
    });
    const editedEmail = { ...PROPOSED_EMAIL, subject: 'Renewal confirmed' };

    const completion = await parseCall().complete({
      output: { decision: 'send', email: editedEmail },
      context,
    });

    expect(context.executeTool).toHaveBeenCalledWith({
      toolName: 'send_email',
      args: {
        recipients: PROPOSED_EMAIL.recipients,
        subject: 'Renewal confirmed',
        body: '<p>Hi Tim,<br>Thanks for renewing.</p><p>Best, Jane</p>',
        connectedAccountId: PROPOSED_EMAIL.connectedAccountId,
      },
    });
    expect(completion.toolResult).toEqual({
      success: true,
      message: 'Email sent successfully to tim@apple.dev',
      result: {
        status: 'sent',
        email: editedEmail,
        details: { messageId: 'message-id' },
      },
    });
    expect(completion.answerText).toBe(
      'Send the email "Renewal confirmed" to tim@apple.dev.',
    );
  });

  it('sends from the proposed account even when the answer names another', async () => {
    const context = buildContext({ success: true, message: 'Email sent' });

    await parseCall().complete({
      output: {
        decision: 'send',
        email: {
          ...PROPOSED_EMAIL,
          connectedAccountId: '20202020-1111-4111-8111-111111111111',
        },
      },
      context,
    });

    expect(context.executeTool).toHaveBeenCalledWith({
      toolName: 'send_email',
      args: expect.objectContaining({
        connectedAccountId: PROPOSED_EMAIL.connectedAccountId,
      }),
    });
  });

  it('saves the email as a draft through draft_email', async () => {
    const context = buildContext({ success: true, message: 'Draft created' });

    const completion = await parseCall().complete({
      output: { decision: 'saveDraft', email: PROPOSED_EMAIL },
      context,
    });

    expect(context.executeTool).toHaveBeenCalledWith({
      toolName: 'draft_email',
      args: expect.objectContaining({ subject: 'Your renewal' }),
    });
    expect(completion.toolResult).toMatchObject({
      success: true,
      result: { status: 'drafted' },
    });
  });

  it('tells the agent when the email could not go through', async () => {
    const context = buildContext({
      success: false,
      message: 'Failed to send email',
      error:
        'The connected email account does not have permission to send emails.',
    });

    const completion = await parseCall().complete({
      output: { decision: 'send', email: PROPOSED_EMAIL },
      context,
    });

    expect(completion.toolResult).toMatchObject({
      success: false,
      result: {
        status: 'failed',
        error:
          'The connected email account does not have permission to send emails.',
      },
    });
  });

  it('runs no tool when the email is discarded', async () => {
    const context = buildContext({ success: true, message: '' });

    const completion = await parseCall().complete({
      output: { decision: 'discard' },
      context,
    });

    expect(context.executeTool).not.toHaveBeenCalled();
    expect(completion.toolResult).toMatchObject({
      result: { status: 'discarded', email: PROPOSED_EMAIL },
    });
  });
});
