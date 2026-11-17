import { enqueueJobs, getConnection, kv } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { googleMeetHandleEventHandler } from 'src/logic-functions/google-meet-handle-event';
import { buildGoogleMeetArtifactImportJob } from 'src/logic-functions/utils/build-google-meet-artifact-import-job.util';
import { getGoogleMeetConferenceRecord } from 'src/logic-functions/utils/get-google-meet-conference-record.util';

vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: vi.fn(),
  getConnection: vi.fn(),
  kv: { get: vi.fn() },
}));

vi.mock(
  'src/logic-functions/utils/get-google-meet-conference-record.util',
  () => ({ getGoogleMeetConferenceRecord: vi.fn() }),
);

const TRANSCRIPT_EVENT = {
  subscriptionName: 'subscriptions/first',
  eventType: 'google.workspace.meet.transcript.v2.fileGenerated',
  artifactName: 'conferenceRecords/first/transcripts/first',
};

const CONFERENCE_RECORD = {
  name: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
  endTime: '2026-11-17T09:30:00Z',
  space: 'spaces/first',
};

describe('googleMeetHandleEventHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(kv.get).mockResolvedValue('connected-account-id');
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
    });
    vi.mocked(getGoogleMeetConferenceRecord).mockResolvedValue(
      CONFERENCE_RECORD,
    );
  });

  it('should queue the import of the conference whose transcript is ready', async () => {
    await expect(
      googleMeetHandleEventHandler(TRANSCRIPT_EVENT),
    ).resolves.toEqual({ success: true, outcome: 'IMPORT_QUEUED' });

    expect(kv.get).toHaveBeenCalledExactlyOnceWith(
      'google-meet-event-subscription:subscriptions/first',
    );
    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(getGoogleMeetConferenceRecord).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      conferenceRecordName: 'conferenceRecords/first',
    });
    expect(enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
      jobs: [
        buildGoogleMeetArtifactImportJob({
          connectedAccountId: 'connected-account-id',
          conferenceRecord: CONFERENCE_RECORD,
          artifactName: 'conferenceRecords/first/transcripts/first',
        }),
      ],
    });
  });

  it('should ignore the events it does not import', async () => {
    await expect(
      googleMeetHandleEventHandler({
        ...TRANSCRIPT_EVENT,
        eventType: 'google.workspace.meet.conference.v2.ended',
      }),
    ).resolves.toEqual({ success: true, outcome: 'EVENT_TYPE_IGNORED' });

    expect(kv.get).not.toHaveBeenCalled();
    expect(enqueueJobs).not.toHaveBeenCalled();
  });

  it('should skip a subscription that no connection owns', async () => {
    vi.mocked(kv.get).mockResolvedValue(null);

    await expect(
      googleMeetHandleEventHandler(TRANSCRIPT_EVENT),
    ).resolves.toEqual({
      success: true,
      outcome: 'SUBSCRIPTION_WITHOUT_CONNECTION',
    });

    expect(getConnection).not.toHaveBeenCalled();
    expect(enqueueJobs).not.toHaveBeenCalled();
  });

  it('should refuse an event without a valid transcript or smart note name', async () => {
    await expect(
      googleMeetHandleEventHandler({
        ...TRANSCRIPT_EVENT,
        artifactName: 'conferenceRecords/first',
      }),
    ).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet artifact event',
    });

    expect(kv.get).not.toHaveBeenCalled();
  });

  it('should refuse an event without subscription or type', async () => {
    await expect(googleMeetHandleEventHandler({})).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet event',
    });

    expect(kv.get).not.toHaveBeenCalled();
  });
});
