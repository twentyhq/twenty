import { enqueueGranolaJobOrThrow } from 'src/logic-functions/utils/enqueue-granola-job-or-throw.util';
import { getGranolaJobId } from 'src/logic-functions/utils/get-granola-job-id.util';

export const enqueueGranolaRetryOrThrow = async <
  TPayload extends Record<string, unknown> & { retryAttempt?: number },
>({
  logicFunctionUniversalIdentifier,
  prefix,
  payload,
  delayMs,
}: {
  logicFunctionUniversalIdentifier: string;
  prefix: Parameters<typeof getGranolaJobId>[0]['prefix'];
  payload: TPayload;
  delayMs: number;
}): Promise<void> => {
  const retryPayload: TPayload = {
    ...payload,
    retryAttempt: (payload.retryAttempt ?? 0) + 1,
  };

  await enqueueGranolaJobOrThrow({
    logicFunctionUniversalIdentifier,
    payload: retryPayload,
    jobId: getGranolaJobId({ prefix, identity: retryPayload }),
    delayMs,
  });
};
