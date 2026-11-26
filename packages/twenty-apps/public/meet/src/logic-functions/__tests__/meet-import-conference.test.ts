import { CoreApiClient } from 'twenty-client-sdk/core';
import { getConnection } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { meetImportConferenceHandler } from 'src/logic-functions/meet-import-conference';
import { syncMeetConferenceOrThrow } from 'src/logic-functions/utils/sync-meet-conference-or-throw.util';

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: vi.fn() }));

vi.mock('twenty-sdk/logic-function', () => ({ getConnection: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/sync-meet-conference-or-throw.util',
  () => ({ syncMeetConferenceOrThrow: vi.fn() }),
);

const JOB = {
  connectedAccountId: 'connected-account-id',
  conferenceRecordName: 'conferenceRecords/first',
  startTime: '2026-11-17T09:00:00Z',
  endTime: '2026-11-17T09:30:00Z',
  spaceName: 'spaces/meeting-space',
};

describe('meetImportConferenceHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
    });
    vi.mocked(syncMeetConferenceOrThrow).mockResolvedValue({
      outcome: 'CREATED',
      shouldGenerateAiSummary: false,
    });
  });

  it('should import the conference with the token of its connection', async () => {
    await expect(meetImportConferenceHandler(JOB)).resolves.toEqual({
      success: true,
      outcome: 'CREATED',
    });

    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(CoreApiClient).toHaveBeenCalledExactlyOnceWith({
      runAs: 'application',
    });
    expect(syncMeetConferenceOrThrow).toHaveBeenCalledExactlyOnceWith({
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
      meetImportConferenceHandler({ startTime: JOB.startTime }),
    ).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet conference import job',
    });

    expect(getConnection).not.toHaveBeenCalled();
    expect(syncMeetConferenceOrThrow).not.toHaveBeenCalled();
  });

  it('should fail when the connection has no access token', async () => {
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: null,
    });

    await expect(meetImportConferenceHandler(JOB)).rejects.toMatchObject({
      code: 'CONNECTION_WITHOUT_ACCESS_TOKEN',
    });
    expect(syncMeetConferenceOrThrow).not.toHaveBeenCalled();
  });
});
