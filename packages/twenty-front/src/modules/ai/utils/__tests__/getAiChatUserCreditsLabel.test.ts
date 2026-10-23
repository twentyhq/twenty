import { getAiChatUserCreditsLabel } from '@/ai/utils/getAiChatUserCreditsLabel';

describe('getAiChatUserCreditsLabel', () => {
  it.each<[number, string]>([
    [1, '0.63 credits left, reset in 1 day'],
    [3, '0.63 credits left, reset in 3 days'],
  ])(
    'shows what is left and pluralizes %s days',
    (daysUntilReset, expected) => {
      expect(
        getAiChatUserCreditsLabel({
          formattedRemainingCredits: '0.63 credits',
          daysUntilReset,
        }),
      ).toBe(expected);
    },
  );

  it('shows only the reset when the consumption is unavailable', () => {
    expect(
      getAiChatUserCreditsLabel({
        formattedRemainingCredits: null,
        daysUntilReset: 2,
      }),
    ).toBe('Reset in 2 days');
  });
});
