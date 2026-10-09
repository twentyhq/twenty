import { readProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-proposed-tool-call-answer.util';

const EMAIL_ARGUMENTS = {
  recipients: { to: 'team@acme.com' },
  subject: 'Recap',
  body: '<p>Recap</p>',
};

const readAnswer = (result: Record<string, unknown>) =>
  readProposedToolCallAnswer({ success: true, result });

describe('readProposedToolCallAnswer', () => {
  it.each(['send_email', 'draft_email'])(
    'reports %s as executed once approved',
    (toolName) => {
      expect(
        readAnswer({
          status: 'approved',
          proposal: { toolName, arguments: EMAIL_ARGUMENTS },
          output: { messageId: 'message-id' },
        }),
      ).toEqual({
        outcome: 'executed',
        toolName,
        arguments: EMAIL_ARGUMENTS,
        output: { messageId: 'message-id' },
        feedback: null,
        error: null,
      });
    },
  );

  it('keeps the error of an approved call that failed', () => {
    expect(
      readAnswer({
        status: 'failed',
        proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        error: 'No connected account',
      }),
    ).toMatchObject({
      outcome: 'failed',
      toolName: 'send_email',
      output: null,
      error: 'No connected account',
    });
  });

  it('keeps the latest values of a record that changed before approval', () => {
    expect(
      readAnswer({
        status: 'conflict',
        proposal: { toolName: 'update_one_company', arguments: {} },
        output: { latestValues: { employees: 12 } },
      }),
    ).toMatchObject({
      outcome: 'conflict',
      output: { latestValues: { employees: 12 } },
    });
  });

  it('keeps the feedback of a rejected call', () => {
    expect(
      readAnswer({
        status: 'rejected',
        proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        feedback: 'Not yet',
      }),
    ).toMatchObject({
      outcome: 'rejected',
      toolName: 'send_email',
      feedback: 'Not yet',
    });
  });

  it.each(['pending', 'running', 'skipped', undefined])(
    'reads no answer from a %s call',
    (status) => {
      expect(
        readAnswer({
          status,
          proposal: { toolName: 'send_email', arguments: EMAIL_ARGUMENTS },
        }),
      ).toBeUndefined();
    },
  );
});
