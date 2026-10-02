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

  it('splits a title followed by a CRLF line break', () => {
    expect(splitReasoningTitle('**Checking deals**\r\nTwo are open.')).toEqual({
      title: 'Checking deals',
      body: 'Two are open.',
    });
  });

  it('keeps emphasis nested in the title', () => {
    expect(splitReasoningTitle('**Why it *matters***\n\nBody.')).toEqual({
      title: 'Why it *matters*',
      body: 'Body.',
    });
  });

  it('falls back to no title when the bold line is blank', () => {
    expect(splitReasoningTitle('**   **\nBody.')).toEqual({
      title: null,
      body: '**   **\nBody.',
    });
  });
});
