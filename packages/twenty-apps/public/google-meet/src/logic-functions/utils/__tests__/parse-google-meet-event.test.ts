import { describe, expect, it } from 'vitest';

import { parseGoogleMeetEvent } from 'src/logic-functions/utils/parse-google-meet-event.util';

const TRANSCRIPT_DATA = Buffer.from(
  JSON.stringify({
    transcript: { name: 'conferenceRecords/first/transcripts/first' },
  }),
).toString('base64');

describe('parseGoogleMeetEvent', () => {
  it('should read the subscription, type and transcript of a transcript event', () => {
    expect(
      parseGoogleMeetEvent({
        message: {
          attributes: {
            'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
            'ce-type': 'google.workspace.meet.transcript.v2.fileGenerated',
          },
          data: TRANSCRIPT_DATA,
        },
      }),
    ).toEqual({
      subscriptionName: 'subscriptions/first',
      eventType: 'google.workspace.meet.transcript.v2.fileGenerated',
      transcriptName: 'conferenceRecords/first/transcripts/first',
    });
  });

  it('should read an event that carries no transcript', () => {
    expect(
      parseGoogleMeetEvent({
        message: {
          attributes: {
            'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
            'ce-type':
              'google.workspace.events.subscription.v1.expirationReminder',
          },
        },
      }),
    ).toEqual({
      subscriptionName: 'subscriptions/first',
      eventType: 'google.workspace.events.subscription.v1.expirationReminder',
    });
  });

  it('should return nothing for a message that is not a Google Workspace event', () => {
    expect(parseGoogleMeetEvent(null)).toBeUndefined();
    expect(parseGoogleMeetEvent({})).toBeUndefined();
    expect(
      parseGoogleMeetEvent({
        message: {
          attributes: {
            'ce-source': '//other.googleapis.com/subscriptions/first',
            'ce-type': 'google.workspace.meet.transcript.v2.fileGenerated',
          },
        },
      }),
    ).toBeUndefined();
    expect(
      parseGoogleMeetEvent({
        message: {
          attributes: {
            'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
          },
        },
      }),
    ).toBeUndefined();
  });
});
