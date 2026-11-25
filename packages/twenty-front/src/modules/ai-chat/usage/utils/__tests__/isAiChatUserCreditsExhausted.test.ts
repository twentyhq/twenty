import { isAiChatUserCreditsExhausted } from '@/ai-chat/usage/utils/isAiChatUserCreditsExhausted';

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
      }),
    ).toBe(expected);
  });
});
