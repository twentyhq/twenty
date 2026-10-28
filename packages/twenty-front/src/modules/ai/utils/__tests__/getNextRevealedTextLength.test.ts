import { getNextRevealedTextLength } from '@/ai/utils/getNextRevealedTextLength';

const FRAME_DURATION_IN_MS = 1000 / 60;

const revealFrames = ({
  text,
  frameCount,
}: {
  text: string;
  frameCount: number;
}) => {
  const revealedLengths: number[] = [];
  let revealedLength = 0;

  for (let frame = 0; frame < frameCount; frame++) {
    revealedLength = getNextRevealedTextLength({
      text,
      revealedLength,
      elapsedMs: FRAME_DURATION_IN_MS,
    });
    revealedLengths.push(revealedLength);
  }

  return revealedLengths;
};

describe('getNextRevealedTextLength', () => {
  it('should spread a large burst over several frames', () => {
    const text = 'word '.repeat(300);

    const revealedLengths = revealFrames({ text, frameCount: 120 });

    expect(revealedLengths[0]).toBeLessThan(text.length * 0.1);
    expect(revealedLengths.at(-1)).toBe(text.length);
  });

  it('should not jump ahead after an idle pause', () => {
    const text = 'word '.repeat(100);

    const afterPause = getNextRevealedTextLength({
      text,
      revealedLength: 0,
      elapsedMs: 5_000,
    });
    const afterFrame = getNextRevealedTextLength({
      text,
      revealedLength: 0,
      elapsedMs: FRAME_DURATION_IN_MS * 2,
    });

    expect(afterPause).toBe(afterFrame);
  });
});
