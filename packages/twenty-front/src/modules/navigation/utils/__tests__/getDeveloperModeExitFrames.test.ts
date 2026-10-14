import { getDeveloperModeExitFrames } from '@/navigation/utils/getDeveloperModeExitFrames';

describe('getDeveloperModeExitFrames', () => {
  it('switches the label back to the regular font letter by letter', () => {
    expect(
      getDeveloperModeExitFrames('Dev').map(
        ({ text, codeFontStart, codeFontEnd }) => [
          text,
          codeFontStart,
          codeFontEnd,
        ],
      ),
    ).toEqual([
      ['Dev', 0, 3],
      ['Dev', 1, 3],
      ['Dev', 2, 3],
      ['Dev', 3, 3],
    ]);
  });
});
