import { describe, expect, it } from 'vitest';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDING_SUMMARY_PENDING_MARKDOWN } from 'src/logic-functions/constants/call-recording-summary-pending-markdown';
import { claimCallRecordingSummary } from 'src/logic-functions/data/claim-call-recording-summary.util';

describe('claimCallRecordingSummary', () => {
  it('claims only when the summary is still empty and returns true when won', async () => {
    let capturedArgs: { filter: unknown; data: unknown } | undefined;
    const mutation = async (mutationArg: {
      updateCallRecordings: {
        __args: { filter: unknown; data: unknown };
      };
    }) => {
      capturedArgs = mutationArg.updateCallRecordings.__args;

      return { updateCallRecordings: [{ id: 'call-recording-1' }] };
    };
    const client: CoreApiClient = Object.assign(
      Object.create(CoreApiClient.prototype),
      { mutation },
    );

    const claimed = await claimCallRecordingSummary(client, {
      id: 'call-recording-1',
    });

    expect(claimed).toBe(true);
    expect(capturedArgs?.filter).toEqual({
      id: { eq: 'call-recording-1' },
      summary: { markdown: { is: 'NULL' } },
    });
    expect(capturedArgs?.data).toEqual({
      summary: {
        blocknote: null,
        markdown: CALL_RECORDING_SUMMARY_PENDING_MARKDOWN,
      },
    });
  });

  it('returns false when another pass already claimed the summary', async () => {
    const mutation = async () => ({
      updateCallRecordings: [],
    });

    const client: CoreApiClient = Object.assign(
      Object.create(CoreApiClient.prototype),
      { mutation },
    );

    const claimed = await claimCallRecordingSummary(client, {
      id: 'call-recording-1',
    });

    expect(claimed).toBe(false);
  });
});
