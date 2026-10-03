import { addAdditionalInstructionsToLastRunAgentMessage } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/add-additional-instructions-to-last-run-agent-message.util';

describe('addAdditionalInstructionsToLastRunAgentMessage', () => {
  it('should put the instructions before the content of the last message only', () => {
    expect(
      addAdditionalInstructionsToLastRunAgentMessage({
        messages: [
          { role: 'user', content: 'Who owns Acme?' },
          { role: 'user', content: 'And the last touchpoint?' },
        ],
        additionalInstructions: 'Answer in Slack markdown.',
      }),
    ).toEqual([
      { role: 'user', content: 'Who owns Acme?' },
      {
        role: 'user',
        content: 'Answer in Slack markdown.\n\nAnd the last touchpoint?',
      },
    ]);
  });

  it('should use the instructions as the content of a message that only carries files', () => {
    const attachments = [{ fileId: 'file-id', filename: 'deck.pdf' }];

    expect(
      addAdditionalInstructionsToLastRunAgentMessage({
        messages: [{ role: 'user', content: '', attachments }],
        additionalInstructions: 'Answer in Slack markdown.',
      }),
    ).toEqual([
      { role: 'user', content: 'Answer in Slack markdown.', attachments },
    ]);
  });
});
