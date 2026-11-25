import { UnipileCustomAuth } from '@unipile/sdk';

import { type UnipileAuthIntentResult } from 'src/unipile/types/unipile-auth-intent-result.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { requestUnipile } from 'src/unipile/utils/request-unipile.util';

export const solveUnipileCheckpoint = async ({
  intentId,
  code,
  deadlineAtMs,
}: {
  intentId: string;
  code: string;
  deadlineAtMs?: number;
}): Promise<UnipileAuthIntentResult> => {
  const { data } = await requestUnipile(
    'solve checkpoint',
    () =>
      new UnipileCustomAuth().solveCheckpoint({
        ...getUnipileRequestOptions(),
        body: { intent_id: intentId, code },
      }),
    { deadlineAtMs },
  );

  return data;
};
