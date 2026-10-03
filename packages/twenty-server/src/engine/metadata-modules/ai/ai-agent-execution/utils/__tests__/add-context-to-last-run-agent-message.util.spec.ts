import { addContextToLastRunAgentMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/add-context-to-last-run-agent-message.util';

describe('addContextToLastRunAgentMessage', () => {
  it('should put the context before the content of the last message only', () => {
    expect(
      addContextToLastRunAgentMessage({
        messages: [
          { role: 'user', content: 'Who owns Acme?' },
          { role: 'user', content: 'And the last touchpoint?' },
        ],
        context: 'Answer in Slack markdown.',
      }),
    ).toEqual([
      { role: 'user', content: 'Who owns Acme?' },
      {
        role: 'user',
        content: 'Answer in Slack markdown.\n\nAnd the last touchpoint?',
      },
    ]);
  });

  it('should use the context as the content of a message that only carries files', () => {
    const attachments = [{ fileId: 'file-id', filename: 'deck.pdf' }];

    expect(
      addContextToLastRunAgentMessage({
        messages: [{ role: 'user', content: '', attachments }],
        context: 'Answer in Slack markdown.',
      }),
    ).toEqual([
      { role: 'user', content: 'Answer in Slack markdown.', attachments },
    ]);
  });
});
