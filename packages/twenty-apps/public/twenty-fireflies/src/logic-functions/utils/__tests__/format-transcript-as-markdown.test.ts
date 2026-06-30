import { describe, expect, it } from 'vitest';

import { type FirefliesTranscript } from 'src/logic-functions/types/fireflies-transcript.type';
import { formatTranscriptAsMarkdown } from 'src/logic-functions/utils/format-transcript-as-markdown';

const buildTranscript = (
  sentences: FirefliesTranscript['sentences'],
): FirefliesTranscript => ({
  id: 'abc',
  title: 'Test call',
  date: 1700000000000,
  duration: 30,
  meeting_link: 'https://zoom.us/j/1234',
  participants: ['a@example.com'],
  organizer_email: 'a@example.com',
  sentences,
});

describe('formatTranscriptAsMarkdown', () => {
  it('returns a placeholder when there are no sentences', () => {
    const result = formatTranscriptAsMarkdown(buildTranscript([]));

    expect(result).toContain('Fireflies returned no transcript content');
  });

  it('returns a placeholder when sentences is null', () => {
    const result = formatTranscriptAsMarkdown(buildTranscript(null));

    expect(result).toContain('Fireflies returned no transcript content');
  });

  it('groups consecutive sentences from the same speaker into one paragraph', () => {
    const result = formatTranscriptAsMarkdown(
      buildTranscript([
        { speaker_name: 'Sarah', text: 'Hi there', start_time: 0 },
        { speaker_name: 'Sarah', text: 'How are you?', start_time: 1 },
        { speaker_name: 'John', text: 'Doing well, thanks.', start_time: 2 },
      ]),
    );

    expect(result).toBe(
      '**Sarah:** Hi there How are you?\n\n**John:** Doing well, thanks.',
    );
  });

  it('falls back to "Speaker" when the speaker name is missing', () => {
    const result = formatTranscriptAsMarkdown(
      buildTranscript([{ speaker_name: null, text: 'Hello', start_time: 0 }]),
    );

    expect(result).toBe('**Speaker:** Hello');
  });

  it('falls back to "Speaker" when the speaker name is whitespace-only', () => {
    const result = formatTranscriptAsMarkdown(
      buildTranscript([
        { speaker_name: '   ', text: 'Hello', start_time: 0 },
        { speaker_name: '\n\t', text: 'World', start_time: 1 },
      ]),
    );

    expect(result).toBe('**Speaker:** Hello World');
  });

  it('skips empty sentence text', () => {
    const result = formatTranscriptAsMarkdown(
      buildTranscript([
        { speaker_name: 'Sarah', text: '   ', start_time: 0 },
        { speaker_name: 'Sarah', text: 'Hello', start_time: 1 },
      ]),
    );

    expect(result).toBe('**Sarah:** Hello');
  });

  it('returns the placeholder when every sentence is whitespace-only', () => {
    const result = formatTranscriptAsMarkdown(
      buildTranscript([
        { speaker_name: 'Sarah', text: '   ', start_time: 0 },
        { speaker_name: 'John', text: '\n\t', start_time: 1 },
        { speaker_name: null, text: '', start_time: 2 },
      ]),
    );

    expect(result).toContain('Fireflies returned no transcript content');
  });
});
