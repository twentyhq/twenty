import { findAgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/find-agent-run-wait.util';

const WAIT = { type: 'EVENT', eventName: 'company.updated' };

describe('findAgentRunWait', () => {
  it('finds the wait a run paused on, with the call that waits', () => {
    expect(
      findAgentRunWait([
        {
          toolCallId: 'wait-1',
          toolName: 'wait_for_event',
          output: { success: true, result: { status: 'pending', wait: WAIT } },
        },
      ]),
    ).toEqual({ toolCallId: 'wait-1', condition: WAIT });
  });

  it('ignores pending calls of tools that are not waits', () => {
    expect(
      findAgentRunWait([
        {
          toolCallId: 'ask-1',
          toolName: 'ask_question',
          output: { success: true, result: { status: 'pending', wait: WAIT } },
        },
      ]),
    ).toBeUndefined();
  });

  it('ignores a wait call that no longer waits', () => {
    expect(
      findAgentRunWait([
        {
          toolCallId: 'wait-1',
          toolName: 'wait_for_event',
          output: {
            success: true,
            result: { status: 'completed', wait: WAIT },
          },
        },
      ]),
    ).toBeUndefined();
  });

  it('ignores a wait call whose wait cannot be read', () => {
    expect(
      findAgentRunWait([
        {
          toolCallId: 'wait-1',
          toolName: 'wait_for_duration',
          output: { success: true, result: { status: 'pending' } },
        },
      ]),
    ).toBeUndefined();
  });
});
