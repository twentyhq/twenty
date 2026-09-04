import { describe, expect, it } from 'vitest';

import { mapFathomTranscriptToEntries } from 'src/logic-functions/utils/map-fathom-transcript-to-entries.util';

describe('mapFathomTranscriptToEntries', () => {
  it('maps Fathom utterances to CallRecording transcript entries', () => {
    expect(
      mapFathomTranscriptToEntries([
        {
          speaker: { displayName: 'Ada' },
          text: 'Ship the integration.',
          timestamp: '01:02:03',
        },
      ]),
    ).toEqual([
      {
        participant: { name: 'Ada' },
        words: [
          {
            text: 'Ship the integration.',
            start_timestamp: { relative: 3723 },
          },
        ],
      },
    ]);
  });

  it('drops empty utterances and tolerates an invalid timestamp', () => {
    expect(
      mapFathomTranscriptToEntries([
        {
          speaker: { displayName: '' },
          text: '  ',
          timestamp: '00:00:01',
        },
        {
          speaker: { displayName: '' },
          text: 'Hello',
          timestamp: 'invalid',
        },
        {
          speaker: { displayName: 'Ada' },
          text: 'Out of range',
          timestamp: '00:75:00',
        },
      ]),
    ).toEqual([
      {
        participant: { name: 'Speaker' },
        words: [{ text: 'Hello' }],
      },
      {
        participant: { name: 'Ada' },
        words: [{ text: 'Out of range' }],
      },
    ]);
  });
});
