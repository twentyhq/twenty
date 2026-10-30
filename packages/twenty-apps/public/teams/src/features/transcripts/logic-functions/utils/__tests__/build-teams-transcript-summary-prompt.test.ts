import { describe, expect, it } from 'vitest';

import { buildTeamsTranscriptSummaryPrompt } from 'src/features/transcripts/logic-functions/utils/build-teams-transcript-summary-prompt';
import { mapTeamsTranscriptToEntries } from 'src/features/transcripts/logic-functions/utils/map-teams-transcript-to-entries';

describe('buildTeamsTranscriptSummaryPrompt', () => {
  it('should turn an imported Teams transcript into timestamped speaker lines', () => {
    const transcript = mapTeamsTranscriptToEntries(
      [
        'WEBVTT',
        '',
        '00:00:01.000 --> 00:00:03.000',
        '<v Alice Martin>Hello everyone.</v>',
        '',
        '00:00:04.000 --> 00:00:06.000',
        '<v Alice Martin>Let us review pricing.</v>',
        '',
        '01:02:05.500 --> 01:02:07.000',
        '<v Bob Lee>Sounds good.</v>',
        '',
      ].join('\n'),
    );

    expect(
      buildTeamsTranscriptSummaryPrompt({
        transcript,
        title: ' Weekly sync ',
      }),
    ).toBe(
      [
        'Meeting title: Weekly sync',
        '',
        'Transcript:',
        '[0:01] Alice Martin: Hello everyone. Let us review pricing.',
        '[1:02:05] Bob Lee: Sounds good.',
      ].join('\n'),
    );
  });

  it('should label unnamed speakers and omit a blank title', () => {
    expect(
      buildTeamsTranscriptSummaryPrompt({
        transcript: [
          {
            participant: { name: null },
            words: [{ text: 'Can you hear me?' }],
          },
        ],
        title: '  ',
      }),
    ).toBe('Transcript:\nUnknown speaker: Can you hear me?');
  });

  it('should return undefined when the transcript has no spoken text', () => {
    expect(
      buildTeamsTranscriptSummaryPrompt({
        transcript: [
          { participant: { name: 'Alice' }, words: [{ text: '  ' }] },
          { participant: { name: 'Bob' } },
          'not an entry',
        ],
      }),
    ).toBeUndefined();
    expect(buildTeamsTranscriptSummaryPrompt({ transcript: [] })).toBe(
      undefined,
    );
    expect(
      buildTeamsTranscriptSummaryPrompt({ transcript: null }),
    ).toBeUndefined();
  });
});
