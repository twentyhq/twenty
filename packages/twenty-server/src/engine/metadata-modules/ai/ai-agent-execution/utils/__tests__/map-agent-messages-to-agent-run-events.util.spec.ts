import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { mapAgentMessagesToAgentRunEvents } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/map-agent-messages-to-agent-run-events.util';

describe('mapAgentMessagesToAgentRunEvents', () => {
  it('maps text parts to messages and tool parts to their use and result', () => {
    const messages = [
      {
        id: 'user-message',
        role: 'user',
        parts: [{ type: 'text', text: 'Find Acme' }],
      },
      {
        id: 'reply',
        role: 'assistant',
        parts: [
          { type: 'step-start' },
          { type: 'reasoning', text: 'thinking' },
          { type: 'text', text: '' },
          {
            type: 'tool-find_companies',
            toolCallId: 'call-1',
            state: 'output-available',
            input: { name: 'Acme' },
            output: { count: 1 },
          },
          {
            type: 'dynamic-tool',
            toolName: 'send_email',
            toolCallId: 'call-2',
            state: 'output-error',
            input: { to: 'a@acme.com' },
            errorText: 'Mailbox not connected',
          },
          { type: 'text', text: 'Found Acme.' },
        ],
      },
    ] as ExtendedUIMessage[];

    expect(mapAgentMessagesToAgentRunEvents(messages)).toEqual([
      {
        id: 'user-message:text:0',
        type: 'user.message',
        content: [{ type: 'text', text: 'Find Acme' }],
      },
      {
        id: 'tool_use:call-1',
        type: 'agent.tool_use',
        toolUseId: 'call-1',
        name: 'find_companies',
        input: { name: 'Acme' },
      },
      {
        id: 'tool_result:call-1',
        type: 'agent.tool_result',
        toolUseId: 'call-1',
        output: { count: 1 },
        isError: false,
      },
      {
        id: 'tool_use:call-2',
        type: 'agent.tool_use',
        toolUseId: 'call-2',
        name: 'send_email',
        input: { to: 'a@acme.com' },
      },
      {
        id: 'tool_result:call-2',
        type: 'agent.tool_result',
        toolUseId: 'call-2',
        output: 'Mailbox not connected',
        isError: true,
      },
      {
        id: 'reply:text:1',
        type: 'agent.message',
        content: [{ type: 'text', text: 'Found Acme.' }],
      },
    ]);
  });

  it('maps a tool call still waiting for its output to its use alone', () => {
    const messages = [
      {
        id: 'reply',
        role: 'assistant',
        parts: [
          {
            type: 'tool-wait_for_event',
            toolCallId: 'call-1',
            state: 'input-available',
            input: {},
          },
        ],
      },
    ] as ExtendedUIMessage[];

    expect(mapAgentMessagesToAgentRunEvents(messages)).toEqual([
      {
        id: 'tool_use:call-1',
        type: 'agent.tool_use',
        toolUseId: 'call-1',
        name: 'wait_for_event',
        input: {},
      },
    ]);
  });

  it('leaves system messages out', () => {
    const messages = [
      {
        id: 'system-message',
        role: 'system',
        parts: [{ type: 'text', text: 'You are an agent' }],
      },
    ] as ExtendedUIMessage[];

    expect(mapAgentMessagesToAgentRunEvents(messages)).toEqual([]);
  });
});
