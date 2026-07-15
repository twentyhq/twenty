import { isUndefined } from '@sniptt/guards';

import { computeCallRecordingCharge } from 'src/logic-functions/domain/compute-call-recording-charge.util';
import { requestAppBillingCharge } from 'src/logic-functions/data/request-app-billing-charge.util';
import { type AppBillingChargeOutcome } from 'src/logic-functions/types/app-billing-charge-outcome.type';

export type ChargeCompletedCallRecordingOutcome =
  | AppBillingChargeOutcome
  | 'unbillable';

export const chargeCompletedCallRecording = async ({
  callRecordingId,
  startedAt,
  endedAt,
}: {
  callRecordingId: string;
  startedAt: string | undefined;
  endedAt: string | undefined;
}): Promise<ChargeCompletedCallRecordingOutcome> => {
  const charge = computeCallRecordingCharge({ startedAt, endedAt });

  if (isUndefined(charge)) {
    console.warn(
      `[call-recorder] call recording ${callRecordingId} completed without usable recording timestamps; it will not be billed`,
    );

    return 'unbillable';
  }

  const chargeOutcome = await requestAppBillingCharge({
    creditsUsedMicro: charge.creditsUsedMicro,
    quantity: charge.quantityMinutes,
    operationType: 'CALL_RECORDING',
    resourceContext: 'recall',
  });

  if (chargeOutcome === 'rejected' || chargeOutcome === 'unknown') {
    console.warn(
      `[call-recorder] billing charge for call recording ${callRecordingId} ${chargeOutcome === 'rejected' ? 'was rejected' : 'did not confirm'}`,
    );
  }

  return chargeOutcome;
};
