import { enqueueJobs } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/google-meet-import.constant';
import { buildGoogleMeetConferenceImportJob } from 'src/logic-functions/utils/build-google-meet-conference-import-job.util';
import { enqueueGoogleMeetConferenceImportsOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-conference-imports-or-throw.util';

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: vi.fn() }));

const NOW = new Date('2026-11-17T10:15:00Z');

const buildConferenceRecords = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `conferenceRecords/${index}`,
    startTime: '2026-11-17T09:00:00Z',
    endTime: '2026-11-17T09:30:00Z',
  }));

describe('enqueueGoogleMeetConferenceImportsOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue one import job per conference', async () => {
    const conferenceRecords = buildConferenceRecords(2);

    await enqueueGoogleMeetConferenceImportsOrThrow({
      connectedAccountId: 'connected-account-id',
      conferenceRecords,
      now: NOW,
    });

    expect(enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        GOOGLE_MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
      jobs: conferenceRecords.map((conferenceRecord) =>
        buildGoogleMeetConferenceImportJob({
          connectedAccountId: 'connected-account-id',
          conferenceRecord,
          now: NOW,
        }),
      ),
    });
  });

  it('should split the jobs into calls the queue accepts', async () => {
    await enqueueGoogleMeetConferenceImportsOrThrow({
      connectedAccountId: 'connected-account-id',
      conferenceRecords: buildConferenceRecords(
        GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE + 1,
      ),
      now: NOW,
    });

    expect(
      vi.mocked(enqueueJobs).mock.calls.map(([{ jobs }]) => jobs?.length),
    ).toEqual([GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE, 1]);
  });

  it('should queue nothing without conference', async () => {
    await enqueueGoogleMeetConferenceImportsOrThrow({
      connectedAccountId: 'connected-account-id',
      conferenceRecords: [],
      now: NOW,
    });

    expect(enqueueJobs).not.toHaveBeenCalled();
  });
});
