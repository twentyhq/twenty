import { PROPOSE_TOOL_CALL_PAUSING_TOOL } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/propose-tool-call.pausing-tool';

const RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const INPUT = {
  toolName: 'update_one_opportunity',
  arguments: { id: RECORD_ID, stage: 'WON' },
  summary: 'Move the Acme renewal to won',
};

const PROPOSAL = {
  ...INPUT,
  toolLabel: 'Update Opportunity',
  template: 'recordUpdate',
  objectNameSingular: 'opportunity',
  recordId: RECORD_ID,
  currentValues: { stage: 'PROPOSAL' },
};

const PENDING_OUTPUT = {
  success: true,
  result: { status: 'pending', proposal: PROPOSAL },
};

const parseCall = (pendingToolOutput: unknown = PENDING_OUTPUT) => {
  const call = PROPOSE_TOOL_CALL_PAUSING_TOOL.parseCall(
    INPUT,
    pendingToolOutput,
  );

  if (call === null) {
    throw new Error('Expected the call to parse');
  }

  return call;
};

const buildFoundRecordOutput = (record: Record<string, unknown>) => ({
  success: true,
  message: 'Found 1 opportunity records',
  result: { records: [record] },
});

describe('PROPOSE_TOOL_CALL_PAUSING_TOOL', () => {
  it('pauses on the proposal the caller resolves, which chat lists preview', async () => {
    const resolveProposal = jest.fn().mockResolvedValue({ proposal: PROPOSAL });

    expect(
      await PROPOSE_TOOL_CALL_PAUSING_TOOL.prepareCall(INPUT, {
        resolveProposal,
      }),
    ).toEqual({
      input: INPUT,
      pendingOutput: {
        success: true,
        message: expect.any(String),
        result: { status: 'pending', proposal: PROPOSAL },
      },
    });
    expect(resolveProposal).toHaveBeenCalledWith(INPUT);
    expect(parseCall().preview()).toBe('Move the Acme renewal to won');
  });

  it('proposes only emails when the caller lends no resolver', async () => {
    expect(await PROPOSE_TOOL_CALL_PAUSING_TOOL.prepareCall(INPUT)).toEqual({
      error: expect.stringContaining('Only send_email and draft_email'),
    });
  });

  it('hands the model the reason a call could not be proposed', async () => {
    expect(
      await PROPOSE_TOOL_CALL_PAUSING_TOOL.buildTool().execute(INPUT),
    ).toMatchObject({ success: false, error: expect.any(String) });
  });

  it.each([
    ['an unknown decision', { decision: 'maybe' }],
    [
      'arguments that are not an object',
      { decision: 'approve', arguments: 'x' },
    ],
  ])('refuses %s', (_description, output) => {
    expect(parseCall().validate(output)).toMatchObject({ isValid: false });
  });

  it('runs the edited call on the proposed record once the record is unchanged', async () => {
    const executeTool = jest
      .fn()
      .mockResolvedValueOnce(buildFoundRecordOutput({ stage: 'PROPOSAL' }))
      .mockResolvedValueOnce({
        success: true,
        message: 'Updated opportunity',
        result: { id: RECORD_ID, stage: 'NEGOTIATION' },
      });

    const completion = await parseCall().complete({
      output: {
        decision: 'approve',
        arguments: { id: 'another-record', stage: 'NEGOTIATION' },
      },
      context: { executeTool },
    });

    expect(executeTool).toHaveBeenNthCalledWith(1, {
      toolName: 'find_one_opportunity',
      args: { id: RECORD_ID, select: ['stage'] },
    });
    expect(executeTool).toHaveBeenNthCalledWith(2, {
      toolName: 'update_one_opportunity',
      args: { id: RECORD_ID, stage: 'NEGOTIATION' },
    });
    expect(completion.toolResult).toMatchObject({
      success: true,
      result: {
        status: 'approved',
        proposal: { arguments: { id: RECORD_ID, stage: 'NEGOTIATION' } },
        output: { id: RECORD_ID, stage: 'NEGOTIATION' },
      },
    });
    expect(completion.answerText).toBe(
      'Approve "Move the Acme renewal to won".',
    );
  });

  it('runs nothing when the record changed since the call was proposed', async () => {
    const executeTool = jest
      .fn()
      .mockResolvedValueOnce(buildFoundRecordOutput({ stage: 'LOST' }));

    const completion = await parseCall().complete({
      output: { decision: 'approve' },
      context: { executeTool },
    });

    expect(executeTool).toHaveBeenCalledTimes(1);
    expect(completion.toolResult).toMatchObject({
      success: false,
      result: {
        status: 'conflict',
        output: { latestValues: { stage: 'LOST' } },
      },
    });
  });

  it('refuses an approved update that changes a field it did not propose', () => {
    expect(
      parseCall().validate({
        decision: 'approve',
        arguments: { id: RECORD_ID, stage: 'WON', amount: 0 },
      }),
    ).toMatchObject({ isValid: false });
  });

  it('runs nothing when the record cannot be read again', async () => {
    const executeTool = jest.fn().mockResolvedValueOnce({
      success: false,
      message: 'Failed to find opportunity records',
      error: 'Permission denied',
    });

    const completion = await parseCall().complete({
      output: { decision: 'approve' },
      context: { executeTool },
    });

    expect(executeTool).toHaveBeenCalledTimes(1);
    expect(completion.toolResult).toMatchObject({
      success: false,
      result: { status: 'failed', error: 'Permission denied' },
    });
  });

  it('reports a failed call with its error', async () => {
    const executeTool = jest
      .fn()
      .mockResolvedValueOnce(buildFoundRecordOutput({ stage: 'PROPOSAL' }))
      .mockResolvedValueOnce({
        success: false,
        message: 'Failed to update',
        error: 'Permission denied',
      });

    const completion = await parseCall().complete({
      output: { decision: 'approve' },
      context: { executeTool },
    });

    expect(completion.toolResult).toMatchObject({
      success: false,
      result: { status: 'failed', error: 'Permission denied' },
    });
  });

  it('passes the feedback of a rejection back without running anything', async () => {
    const executeTool = jest.fn();

    const completion = await parseCall().complete({
      output: { decision: 'reject', feedback: ' Wait for the signed quote ' },
      context: { executeTool },
    });

    expect(executeTool).not.toHaveBeenCalled();
    expect(completion.toolResult).toMatchObject({
      success: true,
      message:
        'The user rejected the call with this feedback: Wait for the signed quote',
      result: { status: 'rejected', feedback: 'Wait for the signed quote' },
    });
    expect(completion.answerText).toBe(
      'Reject "Move the Acme renewal to won": Wait for the signed quote',
    );
  });

  it('runs nothing when the resolved proposal cannot be read back', async () => {
    const executeTool = jest.fn();

    const completion = await parseCall(null).complete({
      output: { decision: 'approve', feedback: 'Use the new quote' },
      context: { executeTool },
    });

    expect(executeTool).not.toHaveBeenCalled();
    expect(completion.toolResult).toMatchObject({
      success: false,
      result: {
        status: 'failed',
        proposal: { template: 'generic' },
        feedback: 'Use the new quote',
      },
    });
  });

  it('can still reject a call whose proposal cannot be read back', async () => {
    const completion = await parseCall(null).complete({
      output: { decision: 'reject' },
      context: { executeTool: jest.fn() },
    });

    expect(completion.toolResult).toMatchObject({
      result: { status: 'rejected' },
    });
  });

  it('passes the feedback given with an approval on to the agent', async () => {
    const executeTool = jest
      .fn()
      .mockResolvedValueOnce(buildFoundRecordOutput({ stage: 'PROPOSAL' }))
      .mockResolvedValueOnce({ success: true, message: 'Updated' });

    const completion = await parseCall().complete({
      output: { decision: 'approve', feedback: ' Tell the account owner ' },
      context: { executeTool },
    });

    expect(completion.toolResult).toMatchObject({
      message:
        'The user approved the call. Updated The user added: Tell the account owner',
      result: { status: 'approved', feedback: 'Tell the account owner' },
    });
    expect(completion.answerText).toBe(
      'Approve "Move the Acme renewal to won": Tell the account owner',
    );
  });

  it('keeps the proposal in a skipped result', () => {
    expect(parseCall().toSkippedToolResult()).toMatchObject({
      result: { status: 'skipped', proposal: PROPOSAL },
    });
  });

  describe('an email', () => {
    const EMAIL_INPUT = {
      toolName: 'send_email',
      arguments: {
        recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
        subject: 'Renewal',
        body: { type: 'doc', content: [] },
        connectedAccountId: 'proposed-account-id',
      },
      summary: 'Follow up on the renewal',
    };

    const parseEmailCall = () => {
      const call = PROPOSE_TOOL_CALL_PAUSING_TOOL.parseCall(EMAIL_INPUT, {
        success: true,
        result: {
          status: 'pending',
          proposal: {
            ...EMAIL_INPUT,
            toolLabel: 'Send email',
            template: 'email',
            alternativeToolNames: ['draft_email'],
          },
        },
      });

      if (call === null) {
        throw new Error('Expected the call to parse');
      }

      return call;
    };

    it('saves it as a draft, an alternative the proposal offers', async () => {
      const executeTool = jest
        .fn()
        .mockResolvedValue({ success: true, message: 'Draft saved' });

      const completion = await parseEmailCall().complete({
        output: {
          decision: 'approve',
          toolName: 'draft_email',
          arguments: { ...EMAIL_INPUT.arguments, subject: 'Renewal terms' },
        },
        context: { executeTool },
      });

      expect(executeTool).toHaveBeenCalledWith({
        toolName: 'draft_email',
        args: { ...EMAIL_INPUT.arguments, subject: 'Renewal terms' },
      });
      expect(completion.toolResult).toMatchObject({
        result: { status: 'approved', proposal: { toolName: 'draft_email' } },
      });
      expect(completion.answerText).toBe(
        'Approve "Follow up on the renewal", running draft_email instead.',
      );
    });

    it('refuses a tool the proposal does not offer', () => {
      expect(
        parseEmailCall().validate({
          decision: 'approve',
          toolName: 'delete_one_company',
        }),
      ).toMatchObject({ isValid: false });
    });

    it('sends from the proposed account even when the answer names another', async () => {
      const executeTool = jest
        .fn()
        .mockResolvedValue({ success: true, message: 'Email sent' });

      await parseEmailCall().complete({
        output: {
          decision: 'approve',
          arguments: {
            ...EMAIL_INPUT.arguments,
            connectedAccountId: 'another-account-id',
          },
        },
        context: { executeTool },
      });

      expect(executeTool).toHaveBeenCalledWith({
        toolName: 'send_email',
        args: EMAIL_INPUT.arguments,
      });
    });
  });
});
