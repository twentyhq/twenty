import { describe, expect, it } from 'vitest';

import { parseTeamsTranscriptResource } from 'src/features/transcripts/logic-functions/utils/parse-teams-transcript-resource';

const ORGANIZER_ID = '976f4b31-fd01-4e0b-9178-29cc40c14438';

const MEETING_ID =
  'MSo5NzZmNGIzMS1mZDAxLTRlMGItOTE3OC0yOWNjNDBjMTQ0MzgqMCoqMTk6bWVldGluZ19ZMlE=';

const TRANSCRIPT_ID =
  'MSMjMCMjNzU3ODc2ZDYtOTcwMi00MDhkLWFkNDItOTE2ZDNmZjkwZGY4';

describe('parseTeamsTranscriptResource', () => {
  it('should read the ids from the resource Graph sends for transcripts', () => {
    expect(
      parseTeamsTranscriptResource(
        `users/${ORGANIZER_ID}/onlineMeetings('${MEETING_ID}')/transcripts('${TRANSCRIPT_ID}')`,
      ),
    ).toEqual({ meetingId: MEETING_ID, transcriptId: TRANSCRIPT_ID });
  });

  it('should read the ids when the user id is quoted or the path starts with a slash', () => {
    expect(
      parseTeamsTranscriptResource(
        `users('${ORGANIZER_ID}')/onlineMeetings('${MEETING_ID}')/transcripts('${TRANSCRIPT_ID}')`,
      ),
    ).toEqual({ meetingId: MEETING_ID, transcriptId: TRANSCRIPT_ID });
    expect(
      parseTeamsTranscriptResource(
        `/users/${ORGANIZER_ID}/onlineMeetings('${MEETING_ID}')/transcripts('${TRANSCRIPT_ID}')`,
      ),
    ).toEqual({ meetingId: MEETING_ID, transcriptId: TRANSCRIPT_ID });
  });

  it('should decode the ids of a slash-delimited resource', () => {
    expect(
      parseTeamsTranscriptResource(
        `/users/${ORGANIZER_ID}/onlineMeetings/meeting%2Fone%3D/transcripts/transcript%2Fone%3D`,
      ),
    ).toEqual({ meetingId: 'meeting/one=', transcriptId: 'transcript/one=' });
  });

  it.each([
    undefined,
    '',
    'https://graph.microsoft.com/v1.0/users/organizer/onlineMeetings/m/transcripts/t',
    `users/${ORGANIZER_ID}/onlineMeetings/getAllTranscripts`,
    "users/organizer/onlineMeetings('m')/transcripts('t')/content",
    'users/organizer/onlineMeetings/m/transcripts/t/content',
    "users/organizer/onlineMeetings('m')/recordings('r')",
    "users/organizer/onlineMeetings('m')/transcripts('%invalid')",
    'users/organizer/onlineMeetings/m/transcripts/%invalid',
  ])('should reject %s', (resource) => {
    expect(parseTeamsTranscriptResource(resource)).toBeUndefined();
  });
});
