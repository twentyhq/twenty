import { splitReasoningTitle } from '@/ai/utils/splitReasoningTitle';

describe('splitReasoningTitle', () => {
  it('splits the bold title a summary opens with from its body', () => {
    expect(
      splitReasoningTitle(
        '**Searching for Clearstreet**\n\nI need to find the company first.',
      ),
    ).toEqual({
      title: 'Searching for Clearstreet',
      body: 'I need to find the company first.',
    });
  });

  it('accepts a title with no body yet while it streams', () => {
    expect(splitReasoningTitle('**Searching for Clearstreet**')).toEqual({
      title: 'Searching for Clearstreet',
      body: '',
    });
  });

  it('leaves reasoning without a title line untouched', () => {
    expect(splitReasoningTitle('The user wants **all** open deals.')).toEqual({
      title: null,
      body: 'The user wants **all** open deals.',
    });
  });

  it('does not take bold text that runs into the paragraph as a title', () => {
    expect(splitReasoningTitle('**Note** the deal is closed.')).toEqual({
      title: null,
      body: '**Note** the deal is closed.',
    });
  });
});
