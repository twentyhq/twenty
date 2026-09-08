import { beforeEach, expect, it, vi } from 'vitest';

import { reconcileDesktopRecordingsHandler } from 'src/logic-functions/reconcile-desktop-recordings';
import { recoverDesktopRecordings } from 'src/logic-functions/flows/recover-desktop-recordings.util';
import { recoverRecordingCharges } from 'src/logic-functions/flows/recover-recording-charges.util';

vi.mock('twenty-client-sdk/core', () => ({ CoreApiClient: class {} }));
vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (value: unknown) => value,
}));
vi.mock('src/logic-functions/flows/recover-desktop-recordings.util', () => ({
  recoverDesktopRecordings: vi.fn(),
}));
vi.mock('src/logic-functions/flows/recover-recording-charges.util', () => ({
  recoverRecordingCharges: vi.fn(),
}));

beforeEach(() => vi.resetAllMocks());

it('still attempts pending charges during a media recovery outage', async () => {
  vi.mocked(recoverDesktopRecordings).mockRejectedValue(
    new Error('media unavailable'),
  );
  await expect(reconcileDesktopRecordingsHandler()).rejects.toThrow(
    'media unavailable',
  );
  expect(recoverRecordingCharges).toHaveBeenCalledOnce();
});

it('reports a billing recovery failure after media recovery has also run', async () => {
  vi.mocked(recoverRecordingCharges).mockRejectedValue(
    new Error('billing unavailable'),
  );
  await expect(reconcileDesktopRecordingsHandler()).rejects.toThrow(
    'billing unavailable',
  );
  expect(recoverDesktopRecordings).toHaveBeenCalledOnce();
});

vi.mock('src/logic-functions/flows/recover-recording-summaries.util', () => ({
  recoverRecordingSummaries: vi.fn(),
}));
