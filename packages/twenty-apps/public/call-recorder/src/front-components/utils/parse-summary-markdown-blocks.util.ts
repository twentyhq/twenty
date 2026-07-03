import { type SummaryInlineSegment } from 'src/front-components/types/summary-inline-segment.type';
import { type SummaryMarkdownBlock } from 'src/front-components/types/summary-markdown-block.type';
import { parseSummaryInlineSegments } from 'src/front-components/utils/parse-summary-inline-segments.util';

const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const BULLET_PATTERN = /^[-*]\s+(.+)$/;

const flushPendingList = (
  blocks: SummaryMarkdownBlock[],
  pendingListItems: SummaryInlineSegment[][],
): SummaryMarkdownBlock[] =>
  pendingListItems.length > 0
    ? [...blocks, { type: 'list', items: pendingListItems }]
    : blocks;

export const parseSummaryMarkdownBlocks = (
  markdown: string,
): SummaryMarkdownBlock[] => {
  const { blocks, pendingListItems } = markdown.split('\n').reduce<{
    blocks: SummaryMarkdownBlock[];
    pendingListItems: SummaryInlineSegment[][];
  }>(
    (accumulator, rawLine) => {
      const line = rawLine.trim();

      if (line === '') {
        return {
          blocks: flushPendingList(
            accumulator.blocks,
            accumulator.pendingListItems,
          ),
          pendingListItems: [],
        };
      }

      const headingMatch = HEADING_PATTERN.exec(line);

      if (headingMatch !== null) {
        return {
          blocks: [
            ...flushPendingList(
              accumulator.blocks,
              accumulator.pendingListItems,
            ),
            {
              type: 'heading',
              level: headingMatch[1].length,
              segments: parseSummaryInlineSegments(headingMatch[2]),
            },
          ],
          pendingListItems: [],
        };
      }

      const bulletMatch = BULLET_PATTERN.exec(line);

      if (bulletMatch !== null) {
        return {
          blocks: accumulator.blocks,
          pendingListItems: [
            ...accumulator.pendingListItems,
            parseSummaryInlineSegments(bulletMatch[1]),
          ],
        };
      }

      return {
        blocks: [
          ...flushPendingList(accumulator.blocks, accumulator.pendingListItems),
          { type: 'paragraph', segments: parseSummaryInlineSegments(line) },
        ],
        pendingListItems: [],
      };
    },
    { blocks: [], pendingListItems: [] },
  );

  return flushPendingList(blocks, pendingListItems);
};
