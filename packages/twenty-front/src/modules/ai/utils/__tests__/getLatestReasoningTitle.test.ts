import { getLatestReasoningTitle } from '@/ai/utils/getLatestReasoningTitle';

describe('getLatestReasoningTitle', () => {
  it('should return the title of the latest reasoning section', () => {
    expect(
      getLatestReasoningTitle(
        '**Looking into the data**\n\nI need to check.\n\n**Selecting tool fields**\n\nThe query needs',
      ),
    ).toBe('Selecting tool fields');
  });

  it('should ignore bold text inside a sentence', () => {
    expect(
      getLatestReasoningTitle('I should check **employees** first.'),
    ).toBeNull();
  });

  it('should return null without a title', () => {
    expect(getLatestReasoningTitle('Plain reasoning text')).toBeNull();
  });
});
