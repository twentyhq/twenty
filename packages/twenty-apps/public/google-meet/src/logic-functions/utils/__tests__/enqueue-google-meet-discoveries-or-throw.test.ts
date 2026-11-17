import { enqueueJobs } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE } from 'src/logic-functions/constants/google-meet-import.constant';
import { buildGoogleMeetDiscoveryJob } from 'src/logic-functions/utils/build-google-meet-discovery-job.util';
import { enqueueGoogleMeetDiscoveriesOrThrow } from 'src/logic-functions/utils/enqueue-google-meet-discoveries-or-throw.util';

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: vi.fn() }));

const NOW = new Date('2026-11-17T10:15:00Z');

describe('enqueueGoogleMeetDiscoveriesOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should queue one discovery job per connection', async () => {
    await enqueueGoogleMeetDiscoveriesOrThrow({
      connectedAccountIds: ['first', 'second'],
      trigger: 'schedule',
      now: NOW,
    });

    expect(enqueueJobs).toHaveBeenCalledExactlyOnceWith({
      logicFunctionUniversalIdentifier:
        GOOGLE_MEET_QUEUE_CONFERENCE_IMPORTS_UNIVERSAL_IDENTIFIER,
      jobs: ['first', 'second'].map((connectedAccountId) =>
        buildGoogleMeetDiscoveryJob({
          connectedAccountId,
          trigger: 'schedule',
          now: NOW,
        }),
      ),
    });
  });

  it('should split the jobs into calls the queue accepts', async () => {
    await enqueueGoogleMeetDiscoveriesOrThrow({
      connectedAccountIds: Array.from(
        { length: GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE + 1 },
        (_, index) => `connection-${index}`,
      ),
      trigger: 'schedule',
      now: NOW,
    });

    expect(
      vi.mocked(enqueueJobs).mock.calls.map(([{ jobs }]) => jobs?.length),
    ).toEqual([GOOGLE_MEET_IMPORT_JOB_BATCH_SIZE, 1]);
  });

  it('should queue nothing without connection', async () => {
    await enqueueGoogleMeetDiscoveriesOrThrow({
      connectedAccountIds: [],
      trigger: 'schedule',
      now: NOW,
    });

    expect(enqueueJobs).not.toHaveBeenCalled();
  });
});
