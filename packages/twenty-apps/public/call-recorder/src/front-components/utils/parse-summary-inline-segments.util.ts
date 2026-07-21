import { type SummaryInlineSegment } from 'src/front-components/types/summary-inline-segment.type';

const BOLD_PATTERN = /\*\*(.+?)\*\*/g;

// Splits a markdown line into plain and **bold** runs, preserving surrounding
// whitespace so adjacent bold runs don't collapse together.
export const parseSummaryInlineSegments = (
  text: string,
): SummaryInlineSegment[] => {
  const boldMatches = [...text.matchAll(BOLD_PATTERN)];

  const { segments, cursor } = boldMatches.reduce<{
    segments: SummaryInlineSegment[];
    cursor: number;
  }>(
    (accumulator, match) => {
      const matchStart = match.index ?? 0;
      const leadingText = text.slice(accumulator.cursor, matchStart);
      const leadingSegments =
        leadingText.length > 0 ? [{ text: leadingText, isBold: false }] : [];

      return {
        segments: [
          ...accumulator.segments,
          ...leadingSegments,
          { text: match[1], isBold: true },
        ],
        cursor: matchStart + match[0].length,
      };
    },
    { segments: [], cursor: 0 },
  );

  const trailingText = text.slice(cursor);

  return trailingText.length > 0
    ? [...segments, { text: trailingText, isBold: false }]
    : segments;
};
