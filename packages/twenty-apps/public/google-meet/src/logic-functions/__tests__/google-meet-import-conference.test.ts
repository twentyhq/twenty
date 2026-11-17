import { CoreApiClient } from 'twenty-client-sdk/core';
import { getConnection } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { googleMeetImportConferenceHandler } from 'src/logic-functions/google-meet-import-conference';
import { syncGoogleMeetConferenceOrThrow } from 'src/logic-functions/utils/sync-google-meet-conference-or-throw.util';

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({ getConnection: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/sync-google-meet-conference-or-throw.util',
  () => ({ syncGoogleMeetConferenceOrThrow: vi.fn() }),
);

const JOB = {
  connectedAccountId: 'connected-account-id',
  conferenceRecordName: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
  endTime: '2026-11-17T09:30:00Z',
  spaceName: 'spaces/meeting-space',
};

describe('googleMeetImportConferenceHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
    });
    vi.mocked(syncGoogleMeetConferenceOrThrow).mockResolvedValue({
      outcome: 'CREATED',
      shouldGenerateAiSummary: false,
    });
  });

  it('should import the conference with the token of its connection', async () => {
    await expect(googleMeetImportConferenceHandler(JOB)).resolves.toEqual({
      success: true,
      outcome: 'CREATED',
    });

    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(CoreApiClient).toHaveBeenCalledExactlyOnceWith({
      runAs: 'application',
    });
    expect(syncGoogleMeetConferenceOrThrow).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      coreApiClient: expect.any(CoreApiClient),
      conferenceRecord: {
        name: 'conferenceRecords/first',
        startTime: '2026-11-17T09:00:00Z',
        endTime: '2026-11-17T09:30:00Z',
        space: 'spaces/meeting-space',
      },
    });
  });

  it('should refuse a job without conference or connection', async () => {
    await expect(
      googleMeetImportConferenceHandler({ startTime: JOB.startTime }),
    ).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet conference import job',
    });

    expect(getConnection).not.toHaveBeenCalled();
    expect(syncGoogleMeetConferenceOrThrow).not.toHaveBeenCalled();
  });

  it('should fail when the connection has no access token', async () => {
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: null,
    });

    await expect(googleMeetImportConferenceHandler(JOB)).rejects.toMatchObject({
      code: 'CONNECTION_WITHOUT_ACCESS_TOKEN',
    });
    expect(syncGoogleMeetConferenceOrThrow).not.toHaveBeenCalled();
  });
});
