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
  it('should return the full length once everything is revealed', () => {
    expect(
      getNextRevealedTextLength({
        text: 'Hello world',
        revealedLength: 11,
        elapsedMs: FRAME_DURATION_IN_MS,
      }),
    ).toBe(11);
  });

  it('should stop at word ends', () => {
    const text = 'Pipeline hygiene keeps every forecast honest and current.';

    revealFrames({ text, frameCount: 20 }).forEach((revealedLength) => {
      expect(
        revealedLength === text.length || /\s/.test(text[revealedLength]),
      ).toBe(true);
    });
  });

  it('should spread a large burst over several frames', () => {
    const text = 'word '.repeat(300);

    const revealedLengths = revealFrames({ text, frameCount: 120 });

    expect(revealedLengths[0]).toBeLessThan(text.length * 0.1);
    expect(revealedLengths.at(-1)).toBe(text.length);
  });

  it('should only grow', () => {
    const text = 'Short words and some longerwordswithoutspaces then more.';

    const revealedLengths = revealFrames({ text, frameCount: 30 });

    revealedLengths.slice(1).forEach((revealedLength, index) => {
      expect(revealedLength).toBeGreaterThanOrEqual(revealedLengths[index]);
    });
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
