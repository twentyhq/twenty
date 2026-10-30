import { getLogsSwitchEnterFrames } from '@/navigation/utils/getLogsSwitchEnterFrames';

describe('getLogsSwitchEnterFrames', () => {
  const frames = getLogsSwitchEnterFrames({ label: 'Dev', phrase: 'hi' });

  it('switches the label to the code font letter by letter before erasing it', () => {
    expect(
      frames
        .slice(0, 3)
        .map(({ text, codeFontStart, codeFontEnd }) => [
          text,
          codeFontStart,
          codeFontEnd,
        ]),
    ).toEqual([
      ['Dev', 0, 1],
      ['Dev', 0, 2],
      ['Dev', 0, 3],
    ]);
  });

  it('erases the label, types the phrase, erases it and types the label back', () => {
    expect(frames.slice(3).map((frame) => frame.text)).toEqual([
      'De',
      'D',
      '',
      'h',
      'hi',
      'h',
      '',
      'D',
      'De',
      'Dev',
    ]);
  });

  it('writes every typed and erased frame fully in the code font', () => {
    frames.slice(3).forEach((frame) => {
      expect(frame.codeFontStart).toBe(0);
      expect(frame.codeFontEnd).toBe(frame.text.length);
    });
  });

  it('holds the typed phrase longer than any other frame', () => {
    const phraseFrame = frames[frames.findIndex(({ text }) => text === 'hi')];
    const longestOtherDelay = Math.max(
      ...frames
        .filter((frame) => frame !== phraseFrame)
        .map((frame) => frame.delayAfterMs),
    );

    expect(phraseFrame.delayAfterMs).toBeGreaterThan(longestOtherDelay);
  });
});
