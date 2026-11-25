import { UnipileCustomAuth } from '@unipile/sdk';

import { type UnipileAuthIntentResult } from 'src/unipile/types/unipile-auth-intent-result.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const waitForUnipileCheckpoint = async ({
  intentId,
  timeoutMilliseconds,
  deadlineAtMs,
}: {
  intentId: string;
  timeoutMilliseconds: number;
  deadlineAtMs?: number;
}): Promise<UnipileAuthIntentResult | null> => {
  try {
    // Unipile holds a solve with an empty code open until the member acts outside the page
    const { data } = await requestUnipile(
      'wait for checkpoint',
      () =>
        new UnipileCustomAuth().solveCheckpoint({
          ...getUnipileRequestOptions(),
          body: { intent_id: intentId, code: '' },
          signal: AbortSignal.timeout(timeoutMilliseconds),
        }),
      { deadlineAtMs },
    );

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return null;
    }

    throw error;
  }
};
