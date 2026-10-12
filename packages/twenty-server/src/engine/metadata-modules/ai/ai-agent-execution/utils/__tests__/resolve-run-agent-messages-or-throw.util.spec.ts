import { resolveRunAgentMessagesOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-run-agent-messages-or-throw.util';
import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';

describe('resolveRunAgentMessagesOrThrow', () => {
  it('should return the input messages', () => {
    const input = [{ role: 'user' as const, content: 'Who owns Acme?' }];

    expect(resolveRunAgentMessagesOrThrow({ input })).toEqual(input);
  });

  it('should keep accepting a prompt as a single user message', () => {
    expect(
      resolveRunAgentMessagesOrThrow({ prompt: 'Who owns Acme?' }),
    ).toEqual([{ role: 'user', content: 'Who owns Acme?' }]);
  });

  it('should keep accepting messages', () => {
    const messages = [
      { role: 'user' as const, content: 'Who owns Acme?' },
      { role: 'assistant' as const, content: 'Sarah.' },
      { role: 'user' as const, content: 'And the last touchpoint?' },
    ];

    expect(resolveRunAgentMessagesOrThrow({ messages })).toEqual(messages);
  });

  it('should keep accepting blank turns in legacy messages', () => {
    const messages = [
      { role: 'user' as const, content: 'Who owns Acme?' },
      { role: 'assistant' as const, content: '' },
    ];

    expect(resolveRunAgentMessagesOrThrow({ messages })).toEqual(messages);
  });

  it('should accept an input message that only carries files', () => {
    const input = [
      {
        role: 'user' as const,
        content: '',
        attachments: [{ fileId: 'file-id' }],
      },
    ];

    expect(resolveRunAgentMessagesOrThrow({ input })).toEqual(input);
  });

  it.each([
    ['nothing', {}],
    [
      'an empty input next to a prompt',
      { input: [], prompt: 'Who owns Acme?' },
    ],
    [
      'input and prompt',
      {
        input: [{ role: 'user' as const, content: 'Hello' }],
        prompt: 'Hello',
      },
    ],
    ['an empty input', { input: [] }],
    [
      'a blank input message',
      { input: [{ role: 'user' as const, content: '  ' }] },
    ],
    ['an empty prompt', { prompt: '' }],
    ['empty messages', { messages: [] }],
  ])('should refuse %s', (_, sources) => {
    expect(() => resolveRunAgentMessagesOrThrow(sources)).toThrow(
      expect.objectContaining({ code: AiExceptionCode.INVALID_AGENT_INPUT }),
    );
  });
});
