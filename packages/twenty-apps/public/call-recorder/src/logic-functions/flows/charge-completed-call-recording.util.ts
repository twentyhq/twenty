import { isUndefined } from '@sniptt/guards';
import { chargeCredits } from 'twenty-sdk/billing';

import { CALL_RECORDING_BILLABLE_OPERATION_NAME } from 'src/constants/call-recording-billable-operation-name';
import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';

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
      `[call-recorder] call recording ${callRecordingId} completed without usable recording timestamps; it will not be billed`,
    );

    return;
  }

  await chargeCredits({
    operation: CALL_RECORDING_BILLABLE_OPERATION_NAME,
    creditsUsedMicro: charge.creditsUsedMicro,
    quantity: charge.quantityMinutes,
  });
};
