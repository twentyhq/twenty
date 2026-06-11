import { isUndefined } from '@sniptt/guards';
import { chargeCredits } from 'twenty-sdk/billing';

import { computeCallRecordingCharge } from 'src/logic-functions/utils/compute-call-recording-charge.util';

// At-most-once: only called from the write that completes ingestion.
export const chargeCompletedCallRecording = async ({
  callRecordingId,
  startedAt,
  endedAt,
}: {
  callRecordingId: string;
  startedAt: string | undefined;
  endedAt: string | undefined;
}): Promise<void> => {
  const charge = computeCallRecordingCharge({ startedAt, endedAt });

  if (isUndefined(charge)) {
    console.warn(
      `[recall-recording-bot] call recording ${callRecordingId} completed without usable recording timestamps; it will not be billed`,
    );

    return;
  }

  await chargeCredits({
    creditsUsedMicro: charge.creditsUsedMicro,
    quantity: charge.quantityMinutes,
    operationType: 'CALL_RECORDING',
    resourceContext: 'recall',
  });
};
