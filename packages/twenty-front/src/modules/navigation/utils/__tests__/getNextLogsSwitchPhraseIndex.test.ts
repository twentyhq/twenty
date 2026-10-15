import { getNextLogsSwitchPhraseIndex } from '@/navigation/utils/getNextLogsSwitchPhraseIndex';

describe('getNextLogsSwitchPhraseIndex', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('can pick any phrase the first time', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);

    expect(
      getNextLogsSwitchPhraseIndex({
        phraseCount: 8,
        previousPhraseIndex: null,
      }),
    ).toBe(7);
  });

  it('never picks the previous phrase twice in a row', () => {
    const randomValues = [0, 0.2, 0.5, 0.8, 0.99];

    randomValues.forEach((randomValue) => {
      jest.spyOn(Math, 'random').mockReturnValue(randomValue);

      for (
        let previousPhraseIndex = 0;
        previousPhraseIndex < 8;
        previousPhraseIndex++
      ) {
        const phraseIndex = getNextLogsSwitchPhraseIndex({
          phraseCount: 8,
          previousPhraseIndex,
        });

        expect(phraseIndex).not.toBe(previousPhraseIndex);
        expect(phraseIndex).toBeGreaterThanOrEqual(0);
        expect(phraseIndex).toBeLessThan(8);
      }
    });
  });
});
