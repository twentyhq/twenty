import { RestApiClient } from 'twenty-client-sdk/rest';
import { type CallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';

export const postRecordingCharge = async (
  callRecordingId: string,
  charge: CallRecordingCharge,
): Promise<
  { status: 'ACCEPTED'; receiptId: string } | { status: 'DISABLED' }
> => {
  const result = asRecord(
    await new RestApiClient({ runAs: 'application' }).post(
      '/app/billing/charge-idempotent',
      {
        idempotencyKey: `companion-recording:${callRecordingId}`,
        creditsUsedMicro: charge.creditsUsedMicro,
        quantity: charge.quantityMinutes,
        operationType: 'CALL_RECORDING',
        resourceContext: 'recall',
      },
      { signal: AbortSignal.timeout(5_000) },
    ),
  );
  if (result?.status === 'disabled') return { status: 'DISABLED' };
  if (
    result?.status === 'accepted' &&
    typeof result.receiptId === 'string' &&
    result.receiptId.length > 0
  ) {
    return { status: 'ACCEPTED', receiptId: result.receiptId };
  }
  throw new Error(
    'Recording charge response did not contain a durable receipt.',
  );
};
