import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { isSilentAgentChatMessage } from '@/ai/utils/isSilentAgentChatMessage';

const NO_REPLY_PART = {
  type: 'tool-no_reply',
  toolCallId: 'call-1',
  state: 'output-available',
  input: {},
  output: { success: true },
} as const;

const buildMessage = (
  role: ExtendedUIMessage['role'],
  parts: ExtendedUIMessage['parts'],
): ExtendedUIMessage => ({ id: 'message', role, parts });

describe('isSilentAgentChatMessage', () => {
  it('treats an assistant message that only chose not to reply as silent', () => {
    expect(
      isSilentAgentChatMessage(
        buildMessage('assistant', [{ type: 'step-start' }, NO_REPLY_PART]),
      ),
    ).toBe(true);
  });

  it('shows an assistant message that also wrote text', () => {
    expect(
      isSilentAgentChatMessage(
        buildMessage('assistant', [
          NO_REPLY_PART,
          { type: 'text', text: 'Noted.' },
        ]),
      ),
    ).toBe(false);
  });

  it('shows an assistant message that also asked a question', () => {
    expect(
      isSilentAgentChatMessage(
        buildMessage('assistant', [
          NO_REPLY_PART,
          {
            type: 'tool-ask_question',
            toolCallId: 'call-2',
            state: 'input-available',
            input: { question: 'Which company?' },
          },
        ]),
      ),
    ).toBe(false);
  });

  it('shows an ordinary assistant reply', () => {
    expect(
      isSilentAgentChatMessage(
        buildMessage('assistant', [{ type: 'text', text: 'Done.' }]),
      ),
    ).toBe(false);
  });

  it('shows an assistant message that also ran another tool', () => {
    expect(
      isSilentAgentChatMessage(
        buildMessage('assistant', [
          {
            type: 'tool-execute_tool',
            toolCallId: 'call-2',
            state: 'output-available',
            input: { toolName: 'update_one_company', arguments: {} },
            output: { success: true },
          },
          NO_REPLY_PART,
        ]),
      ),
    ).toBe(false);
  });

  it('shows an assistant message whose no_reply call failed', () => {
    expect(
      isSilentAgentChatMessage(
        buildMessage('assistant', [
          {
            type: 'tool-no_reply',
            toolCallId: 'call-1',
            state: 'output-error',
            input: {},
            errorText: 'Invalid input',
          },
        ]),
      ),
    ).toBe(false);
  });
});
