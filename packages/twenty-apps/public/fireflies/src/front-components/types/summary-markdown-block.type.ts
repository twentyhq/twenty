import { type SummaryInlineSegment } from 'src/front-components/types/summary-inline-segment.type';

export type SummaryMarkdownBlock =
  | { type: 'heading'; level: number; segments: SummaryInlineSegment[] }
  | { type: 'paragraph'; segments: SummaryInlineSegment[] }
  | { type: 'list'; items: SummaryInlineSegment[][] };
