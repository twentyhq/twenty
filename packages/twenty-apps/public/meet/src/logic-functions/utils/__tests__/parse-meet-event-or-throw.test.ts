import { describe, expect, it } from 'vitest';

import { parseMeetEventOrThrow } from 'src/logic-functions/utils/parse-meet-event-or-throw.util';

const TRANSCRIPT_DATA = Buffer.from(
  JSON.stringify({
    transcript: { name: 'conferenceRecords/first/transcripts/first' },
  }),
).toString('base64');

describe('parseMeetEventOrThrow', () => {
  it('should read the subscription, type and transcript of a transcript event', () => {
    expect(
      parseMeetEventOrThrow({
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
      artifactName: 'conferenceRecords/first/transcripts/first',
    });
  });

  it('should read the smart note of a Gemini notes event', () => {
    expect(
      parseMeetEventOrThrow({
        message: {
          attributes: {
            'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
            'ce-type': 'google.workspace.meet.smartNote.v2.fileGenerated',
          },
          data: Buffer.from(
            JSON.stringify({
              smartNote: { name: 'conferenceRecords/first/smartNotes/first' },
            }),
          ).toString('base64'),
        },
      }),
    ).toEqual({
      subscriptionName: 'subscriptions/first',
      eventType: 'google.workspace.meet.smartNote.v2.fileGenerated',
      artifactName: 'conferenceRecords/first/smartNotes/first',
    });
  });

  it('should read the recording of a recording event', () => {
    expect(
      parseMeetEventOrThrow({
        message: {
          attributes: {
            'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
            'ce-type': 'google.workspace.meet.recording.v2.fileGenerated',
          },
          data: Buffer.from(
            JSON.stringify({
              recording: { name: 'conferenceRecords/first/recordings/first' },
            }),
          ).toString('base64'),
        },
      }),
    ).toEqual({
      subscriptionName: 'subscriptions/first',
      eventType: 'google.workspace.meet.recording.v2.fileGenerated',
      artifactName: 'conferenceRecords/first/recordings/first',
    });
  });

  it('should read an event that carries no transcript, smart note or recording', () => {
    expect(
      parseMeetEventOrThrow({
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

  it('should fail for an event whose data cannot be read', () => {
    expect(() =>
      parseMeetEventOrThrow({
        message: {
          attributes: {
            'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
            'ce-type': 'google.workspace.meet.transcript.v2.fileGenerated',
          },
          data: Buffer.from('not json').toString('base64'),
        },
      }),
    ).toThrow(expect.objectContaining({ code: 'EVENT_DATA_UNREADABLE' }));
  });

  it('should return nothing for a message that is not a Google Workspace event', () => {
    expect(parseMeetEventOrThrow(null)).toBeUndefined();
    expect(parseMeetEventOrThrow({})).toBeUndefined();
    expect(
      parseMeetEventOrThrow({
        message: {
          attributes: {
            'ce-source': '//other.googleapis.com/subscriptions/first',
            'ce-type': 'google.workspace.meet.transcript.v2.fileGenerated',
          },
        },
      }),
    ).toBeUndefined();
    expect(
      parseMeetEventOrThrow({
        message: {
          attributes: {
            'ce-source': '//workspaceevents.googleapis.com/subscriptions/first',
          },
        },
      }),
    ).toBeUndefined();
  });
});
