import {
  enqueueJobs,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { beforeEach, expect, it, vi } from 'vitest';

import { reconcileDesktopRecordingsHandler } from 'src/logic-functions/utils/reconcileDesktopRecordingsHandler';
import { recoverDesktopRecordings } from 'src/logic-functions/flows/utils/recoverDesktopRecordings';
import { recoverRecordingSummaries } from 'src/logic-functions/flows/utils/recoverRecordingSummaries';

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: class {} }));
vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (value: unknown) => value,
}));
vi.mock('src/logic-functions/flows/utils/recoverDesktopRecordings', () => ({
  recoverDesktopRecordings: vi.fn(),
}));
beforeEach(() => vi.resetAllMocks());

it('still attempts summary persistence during a media recovery outage', async () => {
  vi.mocked(recoverDesktopRecordings).mockRejectedValue(
    new Error('media unavailable'),
  );
  await expect(
    reconcileDesktopRecordingsHandler({ recover: true }, {
      workspaceId: 'workspace-1',
    } as LogicFunctionExecutionContext),
  ).rejects.toThrow('media unavailable');
  expect(recoverRecordingSummaries).toHaveBeenCalledOnce();
});

it('reports a summary recovery failure after media recovery has also run', async () => {
  vi.mocked(recoverRecordingSummaries).mockRejectedValue(
    new Error('summary unavailable'),
  );
  await expect(
    reconcileDesktopRecordingsHandler({ recover: true }, {
      workspaceId: 'workspace-1',
    } as LogicFunctionExecutionContext),
  ).rejects.toThrow('summary unavailable');
  expect(recoverDesktopRecordings).toHaveBeenCalledOnce();
});

vi.mock('src/logic-functions/flows/utils/recoverRecordingSummaries', () => ({
  recoverRecordingSummaries: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', () => ({ enqueueJobs: vi.fn() }));
it('queues recovery with a stable workspace-specific delay instead of calling Recall in the cron', async () => {
  const context = {
    workspaceId: 'workspace-1',
  } as LogicFunctionExecutionContext;
  await reconcileDesktopRecordingsHandler({}, context);
  await reconcileDesktopRecordingsHandler({}, context);
  const [first, second] = vi.mocked(enqueueJobs).mock.calls;
  expect(first[0].delayMs).toBe(second[0].delayMs);
  expect(first[0].delayMs).toBeGreaterThan(0);
  expect(first[0].delayMs).toBeLessThan(300_000);
  expect(recoverDesktopRecordings).not.toHaveBeenCalled();
  expect(recoverRecordingSummaries).not.toHaveBeenCalled();
  await reconcileDesktopRecordingsHandler({}, {
    workspaceId: 'workspace-2',
  } as LogicFunctionExecutionContext);
  expect(vi.mocked(enqueueJobs).mock.calls[2][0].delayMs).not.toBe(
    first[0].delayMs,
  );
});
