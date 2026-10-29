const FRAME_DURATION_IN_MS = 1000 / 60;
const BACKLOG_SHARE_REVEALED_PER_FRAME = 0.06;
const MINIMUM_CHARACTERS_REVEALED_PER_MS = 0.06;
const MAXIMUM_ELAPSED_FRAME_COUNT = 2;

export const getNextRevealedTextLength = ({
  text,
  revealedLength,
  elapsedMs,
}: {
  text: string;
  revealedLength: number;
  elapsedMs: number;
}): number => {
  const backlogLength = text.length - revealedLength;

  if (backlogLength <= 0) {
    return text.length;
  }

  const elapsedFrameCount = Math.min(
    Math.max(elapsedMs / FRAME_DURATION_IN_MS, 1),
    MAXIMUM_ELAPSED_FRAME_COUNT,
  );
  const backlogShareToReveal =
    1 - (1 - BACKLOG_SHARE_REVEALED_PER_FRAME) ** elapsedFrameCount;

  const revealedCharacterCount = Math.max(
    Math.ceil(backlogLength * backlogShareToReveal),
    Math.ceil(
      MINIMUM_CHARACTERS_REVEALED_PER_MS *
        elapsedFrameCount *
        FRAME_DURATION_IN_MS,
    ),
  );

  const nextLength = Math.min(
    text.length,
    revealedLength + revealedCharacterCount,
  );

  const distanceToWordEnd = text.slice(nextLength).search(/\s/);

  return distanceToWordEnd === -1
    ? text.length
    : nextLength + distanceToWordEnd;
};
