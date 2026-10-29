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

  it('should reveal text without spaces gradually', () => {
    const text =
      '销售团队使用客户关系管理系统来跟踪每一个潜在客户的进展情况'.repeat(4);

    const revealedLengths = revealFrames({ text, frameCount: 3 });

    expect(revealedLengths[0]).toBeLessThan(text.length / 4);
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
