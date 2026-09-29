import { splitEmailRecipients } from '@/ai/utils/splitEmailRecipients';

describe('splitEmailRecipients', () => {
  it('reads each address of a comma-separated list', () => {
    expect(
      splitEmailRecipients(' tim@apple.dev, phil@apple.dev;jony@apple.dev '),
    ).toEqual(['tim@apple.dev', 'phil@apple.dev', 'jony@apple.dev']);
  });

  it('reads no address from an empty list', () => {
    expect(splitEmailRecipients(' , ')).toEqual([]);
  });
});
