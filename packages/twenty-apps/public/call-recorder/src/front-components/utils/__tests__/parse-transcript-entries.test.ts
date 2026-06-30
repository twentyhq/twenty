import { describe, expect, it } from 'vitest';

import { parseTranscriptEntries } from 'src/front-components/utils/parse-transcript-entries.util';

describe('parseTranscriptEntries', () => {
  it('parses diarized entries into speaker, start time, and joined text', () => {
    expect(
      parseTranscriptEntries([
        {
          participant: { id: 100, name: 'Ada Lovelace' },
          words: [
            {
              text: 'Hello',
              start_timestamp: {
                relative: 1.2,
                absolute: '2026-06-12T10:00:01Z',
              },
              end_timestamp: {
                relative: 1.6,
                absolute: '2026-06-12T10:00:01Z',
              },
            },
            {
              text: 'there',
              start_timestamp: {
                relative: 1.7,
                absolute: '2026-06-12T10:00:02Z',
              },
              end_timestamp: {
                relative: 2.1,
                absolute: '2026-06-12T10:00:02Z',
              },
            },
          ],
        },
        {
          participant: { id: 101, name: 'Grace Hopper' },
          words: [
            {
              text: 'Hi',
              start_timestamp: {
                relative: 3.4,
                absolute: '2026-06-12T10:00:03Z',
              },
            },
          ],
        },
      ]),
    ).toEqual([
      {
        speakerName: 'Ada Lovelace',
        startSeconds: 1.2,
        endSeconds: 2.1,
        text: 'Hello there',
        words: [
          { text: 'Hello', startSeconds: 1.2, endSeconds: 1.6 },
          { text: 'there', startSeconds: 1.7, endSeconds: 2.1 },
        ],
      },
      {
        speakerName: 'Grace Hopper',
        startSeconds: 3.4,
        endSeconds: undefined,
        text: 'Hi',
        words: [{ text: 'Hi', startSeconds: 3.4, endSeconds: undefined }],
      },
    ]);
  });

  it('falls back to an unknown speaker when the participant has no name', () => {
    expect(
      parseTranscriptEntries([
        { participant: { id: 100, name: null }, words: [{ text: 'Hello' }] },
        { words: [{ text: 'Hi' }] },
      ]),
    ).toEqual([
      {
        speakerName: 'Unknown speaker',
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Hello',
        words: [
          { text: 'Hello', startSeconds: undefined, endSeconds: undefined },
        ],
      },
      {
        speakerName: 'Unknown speaker',
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Hi',
        words: [{ text: 'Hi', startSeconds: undefined, endSeconds: undefined }],
      },
    ]);
  });

  it('returns an undefined start time when the first word has no relative timestamp', () => {
    expect(
      parseTranscriptEntries([
        {
          participant: { name: 'Ada Lovelace' },
          words: [
            {
              text: 'Hello',
              start_timestamp: { absolute: '2026-06-12T10:00:01Z' },
            },
          ],
        },
      ]),
    ).toEqual([
      {
        speakerName: 'Ada Lovelace',
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Hello',
        words: [
          { text: 'Hello', startSeconds: undefined, endSeconds: undefined },
        ],
      },
    ]);
  });

  it('skips entries without usable words instead of failing the whole transcript', () => {
    expect(
      parseTranscriptEntries([
        { participant: { name: 'Ada Lovelace' }, words: [] },
        { participant: { name: 'Grace Hopper' } },
        {
          participant: { name: 'Alan Turing' },
          words: [{ text: '   ' }, 42, null],
        },
        { participant: { name: 'Joan Clarke' }, words: [{ text: 'Kept' }] },
        'not an entry',
      ]),
    ).toEqual([
      {
        speakerName: 'Joan Clarke',
        startSeconds: undefined,
        endSeconds: undefined,
        text: 'Kept',
        words: [
          { text: 'Kept', startSeconds: undefined, endSeconds: undefined },
        ],
      },
    ]);
  });

  it('returns an empty list for an empty transcript array', () => {
    expect(parseTranscriptEntries([])).toEqual([]);
  });

  it('returns undefined for values that are not a diarized transcript array', () => {
    expect(parseTranscriptEntries(null)).toBeUndefined();
    expect(parseTranscriptEntries(undefined)).toBeUndefined();
    expect(parseTranscriptEntries('transcript text')).toBeUndefined();
    expect(
      parseTranscriptEntries({
        recallTranscriptId: 'recall-transcript-1',
        status: 'PENDING',
      }),
    ).toBeUndefined();
  });
});
