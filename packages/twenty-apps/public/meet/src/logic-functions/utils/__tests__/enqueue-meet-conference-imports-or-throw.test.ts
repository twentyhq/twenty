import { enqueueJobs } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/meet-import.constant';
import { buildMeetConferenceImportJob } from 'src/logic-functions/utils/build-meet-conference-import-job.util';
import { enqueueMeetConferenceImportsOrThrow } from 'src/logic-functions/utils/enqueue-meet-conference-imports-or-throw.util';

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: vi.fn() }));

const NOW = new Date('2026-11-17T10:15:00Z');

const buildConferenceRecords = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    name: `conferenceRecords/${index}`,
    startTime: '2026-11-17T09:00:00Z',
    endTime: '2026-11-17T09:30:00Z',
  }));

describe('enqueueMeetConferenceImportsOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue one import job per conference', async () => {
    const conferenceRecords = buildConferenceRecords(2);

    await enqueueMeetConferenceImportsOrThrow({
      connectedAccountId: 'connected-account-id',
      conferenceRecords,
      now: NOW,
    });

    expect(enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        MEET_IMPORT_CONFERENCE_UNIVERSAL_IDENTIFIER,
      jobs: conferenceRecords.map((conferenceRecord) =>
        buildMeetConferenceImportJob({
          connectedAccountId: 'connected-account-id',
          conferenceRecord,
          now: NOW,
        }),
      ),
    });
  });

  it('should split the jobs into calls the queue accepts', async () => {
    await enqueueMeetConferenceImportsOrThrow({
      connectedAccountId: 'connected-account-id',
      conferenceRecords: buildConferenceRecords(
        MEET_IMPORT_JOB_BATCH_SIZE + 1,
      ),
      now: NOW,
    });

    expect(
      vi.mocked(enqueueJobs).mock.calls.map(([{ jobs }]) => jobs?.length),
    ).toEqual([MEET_IMPORT_JOB_BATCH_SIZE, 1]);
  });

  it('should queue nothing without conference', async () => {
    await enqueueMeetConferenceImportsOrThrow({
      connectedAccountId: 'connected-account-id',
      conferenceRecords: [],
      now: NOW,
    });

    expect(enqueueJobs).not.toHaveBeenCalled();
  });
});
