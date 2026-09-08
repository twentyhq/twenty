import { beforeEach, expect, it, vi } from 'vitest';

import { reconcileDesktopRecordingsHandler } from 'src/logic-functions/reconcile-desktop-recordings';
import { recoverDesktopRecordings } from 'src/logic-functions/flows/recover-desktop-recordings.util';
import { recoverRecordingSummaries } from 'src/logic-functions/flows/recover-recording-summaries.util';

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: class {} }));
vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (value: unknown) => value,
}));
vi.mock('src/logic-functions/flows/recover-desktop-recordings.util', () => ({
  recoverDesktopRecordings: vi.fn(),
}));
beforeEach(() => vi.resetAllMocks());

it('still attempts summary persistence during a media recovery outage', async () => {
  vi.mocked(recoverDesktopRecordings).mockRejectedValue(
    new Error('media unavailable'),
  );
  await expect(reconcileDesktopRecordingsHandler()).rejects.toThrow(
    'media unavailable',
  );
  expect(recoverRecordingSummaries).toHaveBeenCalledOnce();
});

it('reports a summary recovery failure after media recovery has also run', async () => {
  vi.mocked(recoverRecordingSummaries).mockRejectedValue(
    new Error('summary unavailable'),
  );
  await expect(reconcileDesktopRecordingsHandler()).rejects.toThrow(
    'summary unavailable',
  );
  expect(recoverDesktopRecordings).toHaveBeenCalledOnce();
});

vi.mock('src/logic-functions/flows/recover-recording-summaries.util', () => ({
  recoverRecordingSummaries: vi.fn(),
}));
