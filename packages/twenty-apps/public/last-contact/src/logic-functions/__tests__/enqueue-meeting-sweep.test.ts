import { beforeEach, describe, expect, it, vi } from 'vitest';

const { enqueueJobsMock } = vi.hoisted(() => ({ enqueueJobsMock: vi.fn() }));
vi.mock('twenty-sdk/logic-function', () => ({
  enqueueJobs: enqueueJobsMock,
}));

import { MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

import enqueueMeetingSweep from '../enqueue-meeting-sweep';

const WORKSPACE_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_WORKSPACE_ID = '22222222-2222-2222-2222-222222222222';
const DAY_MS = 24 * 60 * 60 * 1000;

const handler = enqueueMeetingSweep.config.handler as (
  payload: unknown,
  context: { workspaceId: string },
) => Promise<void>;

const enqueuedDelayFor = async (workspaceId: string): Promise<number> => {
  enqueueJobsMock.mockClear();
  await handler({}, { workspaceId });

  return enqueueJobsMock.mock.calls[0][0].delayMs;
};

beforeEach(() => {
  enqueueJobsMock.mockReset();
  enqueueJobsMock.mockResolvedValue({ enqueued: true });
});

describe('enqueue-meeting-sweep', () => {
  it('should be valid and run once a day', () => {
    expect(enqueueMeetingSweep.success).toBe(true);
    expect(enqueueMeetingSweep.config.cronTriggerSettings).toEqual({
      pattern: '0 0 * * *',
    });
  });

  it('should enqueue the sweep without calling the core API', async () => {
    await handler({}, { workspaceId: WORKSPACE_ID });

    expect(enqueueJobsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        logicFunctionUniversalIdentifier:
          MEETING_SWEEP_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
      }),
    );
  });

  it('should spread workspaces across the day with a stable delay', async () => {
    const delayMs = await enqueuedDelayFor(WORKSPACE_ID);

    expect(delayMs).toBeGreaterThanOrEqual(0);
    expect(delayMs).toBeLessThan(DAY_MS);
    expect(await enqueuedDelayFor(WORKSPACE_ID)).toBe(delayMs);
    expect(await enqueuedDelayFor(OTHER_WORKSPACE_ID)).not.toBe(delayMs);
  });
});
