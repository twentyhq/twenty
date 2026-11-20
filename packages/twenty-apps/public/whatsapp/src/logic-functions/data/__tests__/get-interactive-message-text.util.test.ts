import { describe, expect, it } from 'vitest';
import { getInteractiveMessageText } from 'src/logic-functions/data/get-interactive-message-text.util';

describe('getInteractiveMessageText', () => {
  it('should omit a missing list reply description', () => {
    expect(
      getInteractiveMessageText({ type: 'list_reply', list_reply: { id: 'option-1', title: 'Option 1' } }),
    ).toBe('Option 1');
  });

  it('should keep the flow response of a flow reply', () => {
    expect(
      getInteractiveMessageText({
        type: 'nfm_reply',
        nfm_reply: { name: 'flow', body: 'Sent', response_json: '{"rating":"5"}' },
      }),
    ).toBe('Sent\n\n{"rating":"5"}');
  });
});
