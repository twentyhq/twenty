import { describe, expect, it, vi } from 'vitest';

import { CALL_RECORDING_SUMMARY_PENDING_MARKDOWN } from 'src/logic-functions/constants/call-recording-summary-pending-markdown';
import { claimCallRecordingSummary } from 'src/logic-functions/data/claim-call-recording-summary.util';

describe('claimCallRecordingSummary', () => {
  it('claims only when the summary is still empty and returns true when won', async () => {
    let capturedArgs: { filter: unknown; data: unknown } | undefined;
    const mutation = vi.fn(async (mutationArg: any) => {
      capturedArgs = mutationArg.updateCallRecordings.__args;

      return { updateCallRecordings: [{ id: 'call-recording-1' }] };
    });

    const claimed = await claimCallRecordingSummary({ mutation } as never, {
      id: 'call-recording-1',
    });

    expect(claimed).toBe(true);
    expect(capturedArgs?.filter).toEqual({
      id: { eq: 'call-recording-1' },
      summary: { markdown: { is: 'NULL' } },
    });
    expect(capturedArgs?.data).toEqual({
      summary: { markdown: CALL_RECORDING_SUMMARY_PENDING_MARKDOWN },
    });
  });

  it('returns false when another pass already claimed the summary', async () => {
    const mutation = vi.fn(async () => ({ updateCallRecordings: [] }));

    const claimed = await claimCallRecordingSummary({ mutation } as never, {
      id: 'call-recording-1',
    });

    expect(claimed).toBe(false);
  });
});
