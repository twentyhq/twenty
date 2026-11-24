import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH } from 'src/constants/sync-member-recording-preference-route-path';
import { SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import syncLogicFunction, {
  syncMemberRecordingPreferenceHandler,
} from 'src/logic-functions/sync-member-recording-preference';

const enqueueLogicFunctionJobsMock = vi.hoisted(() => vi.fn());

vi.mock('src/logic-functions/data/enqueue-logic-function-jobs.util', () => ({
  enqueueLogicFunctionJobs: enqueueLogicFunctionJobsMock,
}));

describe('syncMemberRecordingPreferenceHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('enqueues one sweep of upcoming meetings', async () => {
    await expect(syncMemberRecordingPreferenceHandler()).resolves.toEqual({
      outcome: 'sweep-enqueued',
    });

    expect(enqueueLogicFunctionJobsMock).toHaveBeenCalledTimes(1);
    expect(enqueueLogicFunctionJobsMock).toHaveBeenCalledWith({
      logicFunctionUniversalIdentifier:
        SWEEP_UPCOMING_CALENDAR_EVENTS_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      payloads: [{}],
    });
  });

  it('is served as an authenticated POST route', () => {
    expect(syncLogicFunction.config.httpRouteTriggerSettings).toMatchObject({
      path: SYNC_MEMBER_RECORDING_PREFERENCE_ROUTE_PATH,
      httpMethod: 'POST',
      isAuthRequired: true,
    });
  });
});
