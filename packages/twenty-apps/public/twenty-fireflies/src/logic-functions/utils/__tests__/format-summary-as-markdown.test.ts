import { describe, expect, it } from 'vitest';

import {
  type FirefliesSummary,
  type FirefliesTranscript,
} from 'src/logic-functions/types/fireflies-transcript.type';
import { formatSummaryAsMarkdown } from 'src/logic-functions/utils/format-summary-as-markdown';

const buildTranscript = (
  summary: FirefliesSummary | null | undefined,
): FirefliesTranscript => ({
  id: 'abc',
  title: 'Test call',
  duration: 30,
  meeting_link: 'https://zoom.us/j/1234',
  participants: ['a@example.com'],
  organizer_email: 'a@example.com',
  summary,
});

describe('formatSummaryAsMarkdown', () => {
  it('returns a placeholder when summary is undefined', () => {
    const result = formatSummaryAsMarkdown(buildTranscript(undefined));

    expect(result).toContain('Fireflies returned no summary content');
  });

  it('returns a placeholder when summary is null', () => {
    const result = formatSummaryAsMarkdown(buildTranscript(null));

    expect(result).toContain('Fireflies returned no summary content');
  });

  it('returns a placeholder when every summary section is empty', () => {
    const result = formatSummaryAsMarkdown(
      buildTranscript({
        overview: '',
        action_items: '   ',
        keywords: null,
        topics_discussed: null,
        short_summary: null,
      }),
    );

    expect(result).toContain('Fireflies returned no summary content');
  });

  it('renders overview, action items, topics and keywords in order with headers', () => {
    const result = formatSummaryAsMarkdown(
      buildTranscript({
        overview: '- **Item 1:** First point',
        action_items: '**Abdul**\nDo something (00:10)',
        keywords: ['Twenty', 'Fireflies'],
        topics_discussed: ['Integration', 'Roadmap'],
        short_summary: 'irrelevant',
      }),
    );

    expect(result).toBe(
      [
        '## Overview',
        '',
        '- **Item 1:** First point',
        '',
        '## Action items',
        '',
        '**Abdul**\nDo something (00:10)',
        '',
        '## Topics discussed',
        '',
        'Integration, Roadmap',
        '',
        '## Keywords',
        '',
        'Twenty, Fireflies',
      ].join('\n'),
    );
  });

  it('omits sections that are empty', () => {
    const result = formatSummaryAsMarkdown(
      buildTranscript({
        overview: 'Some overview',
        action_items: null,
        keywords: [],
        topics_discussed: null,
        short_summary: null,
      }),
    );

    expect(result).toBe('## Overview\n\nSome overview');
  });

  it('trims overview and action_items whitespace', () => {
    const result = formatSummaryAsMarkdown(
      buildTranscript({
        overview: '   \n  Overview body  \n  ',
        action_items: '\n**A**\nDo it\n',
        keywords: null,
        topics_discussed: null,
        short_summary: null,
      }),
    );

    expect(result).toBe(
      '## Overview\n\nOverview body\n\n## Action items\n\n**A**\nDo it',
    );
  });
});
