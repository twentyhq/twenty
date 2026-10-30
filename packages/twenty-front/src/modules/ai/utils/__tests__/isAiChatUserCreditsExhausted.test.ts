import { isAiChatUserCreditsExhausted } from '@/ai/utils/isAiChatUserCreditsExhausted';

const periodEnd = '2026-10-26T00:00:00.000Z';

describe('isAiChatUserCreditsExhausted', () => {
  it.each<[number | null, boolean]>([
    [1000000, false],
    [4160000, true],
    [null, false],
  ])('with %s of 4160000 consumed, returns %s', (consumedValue, expected) => {
    expect(
      isAiChatUserCreditsExhausted({
        limitValue: 4160000,
        consumedValue,
        periodEnd,
      }),
    ).toBe(expected);
  });
});
