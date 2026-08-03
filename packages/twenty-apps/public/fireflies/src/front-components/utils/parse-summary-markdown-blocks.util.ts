import { type SummaryInlineSegment } from 'src/front-components/types/summary-inline-segment.type';
import { type SummaryMarkdownBlock } from 'src/front-components/types/summary-markdown-block.type';
import { parseSummaryInlineSegments } from 'src/front-components/utils/parse-summary-inline-segments.util';

const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;
const BULLET_PATTERN = /^[-*]\s+(.+)$/;

export const parseSummaryMarkdownBlocks = (
  markdown: string,
): SummaryMarkdownBlock[] => {
  const blocks: SummaryMarkdownBlock[] = [];
  let pendingListItems: SummaryInlineSegment[][] = [];

  const flushPendingList = () => {
    if (pendingListItems.length > 0) {
      blocks.push({ type: 'list', items: pendingListItems });
      pendingListItems = [];
    }
  };

  for (const rawLine of markdown.split('\n')) {
    const line = rawLine.trim();

    if (line === '') {
      flushPendingList();
      continue;
    }

    const headingMatch = HEADING_PATTERN.exec(line);

    if (headingMatch !== null) {
      flushPendingList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        segments: parseSummaryInlineSegments(headingMatch[2]),
      });
      continue;
    }

    const bulletMatch = BULLET_PATTERN.exec(line);

    if (bulletMatch !== null) {
      pendingListItems.push(parseSummaryInlineSegments(bulletMatch[1]));
      continue;
    }

    flushPendingList();
    blocks.push({
      type: 'paragraph',
      segments: parseSummaryInlineSegments(line),
    });
  }

  flushPendingList();

  return blocks;
};
