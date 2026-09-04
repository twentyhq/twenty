import { describe, expect, it } from 'vitest';

import { parseVttTranscript } from 'src/logic-functions/utils/parse-vtt-transcript.util';

const ATTRIBUTED_VTT = [
  'WEBVTT',
  '',
  'NOTE duration:"00:12:34.5670000"',
  '',
  'a1b2c3/1-0',
  '00:00:01.250 --> 00:00:04.000',
  '<v Ada Lovelace>Hello everyone, thanks for joining.</v>',
  '',
  '2',
  '00:00:04.500 --> 00:00:06.000',
  '<v Grace Hopper>Hi Ada, happy to be here.</v>',
  '',
  '00:01:05.000 --> 00:01:07.000',
  '<v Ada Lovelace>Let&#39;s start with the &quot;pricing&quot; deck.</v>',
  '',
].join('\r\n');

const UNATTRIBUTED_TEXT = [
  'WEBVTT',
  '',
  '00:00:01.250 --> 00:00:04.000',
  'Hello everyone, thanks for joining.',
  '',
  '01:02:03.000 --> 01:02:05.000',
  'Wrapping up now.',
  '',
].join('\n');

describe('parseVttTranscript', () => {
  it('maps speaker-attributed cues to transcript entries', () => {
    const entries = parseVttTranscript(ATTRIBUTED_VTT);

    expect(entries).toEqual([
      {
        participant: { name: 'Ada Lovelace' },
        words: [
          {
            text: 'Hello everyone, thanks for joining.',
            start_timestamp: { relative: 1.25 },
          },
        ],
      },
      {
        participant: { name: 'Grace Hopper' },
        words: [
          {
            text: 'Hi Ada, happy to be here.',
            start_timestamp: { relative: 4.5 },
          },
        ],
      },
      {
        participant: { name: 'Ada Lovelace' },
        words: [
          {
            text: 'Let\'s start with the "pricing" deck.',
            start_timestamp: { relative: 65 },
          },
        ],
      },
    ]);
  });

  it('labels cues without a voice tag with the fallback speaker', () => {
    const entries = parseVttTranscript(UNATTRIBUTED_TEXT);

    expect(entries.map((entry) => entry.participant.name)).toEqual([
      'Speaker',
      'Speaker',
    ]);
    expect(entries[1].words[0].start_timestamp).toEqual({ relative: 3_723 });
  });

  it('skips blocks without a timing line and empty cues', () => {
    const content = [
      'WEBVTT',
      '',
      'STYLE',
      '::cue { color: red }',
      '',
      '00:00:01.000 --> 00:00:02.000',
      '<v Ada>   </v>',
      '',
      '00:00:03.000 --> 00:00:04.000',
      '<v Ada>Still here.</v>',
    ].join('\n');

    expect(parseVttTranscript(content)).toHaveLength(1);
  });

  it('returns an empty list for content that is not WebVTT', () => {
    expect(parseVttTranscript('')).toEqual([]);
    expect(parseVttTranscript('not a transcript')).toEqual([]);
  });
});
