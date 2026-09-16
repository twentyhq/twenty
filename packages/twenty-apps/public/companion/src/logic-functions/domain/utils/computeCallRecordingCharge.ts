import { isUndefined } from '@sniptt/guards';
import { CALL_RECORDING_MICRO_CREDITS_PER_HOUR } from 'src/logic-functions/constants/CALL_RECORDING_MICRO_CREDITS_PER_HOUR';
import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/MILLISECONDS_PER_MINUTE';
import { type CallRecordingCharge } from 'src/logic-functions/types/CallRecordingCharge';

const MILLISECONDS_PER_HOUR = 3_600_000;

export const computeCallRecordingCharge = ({
  startedAt,
  endedAt,
}: {
  startedAt: string | undefined;
  endedAt: string | undefined;
}): CallRecordingCharge | undefined => {
  if (isUndefined(startedAt) || isUndefined(endedAt)) {
    return undefined;
  }

  const durationMilliseconds =
    new Date(endedAt).getTime() - new Date(startedAt).getTime();

  if (!Number.isFinite(durationMilliseconds) || durationMilliseconds <= 0) {
    return undefined;
  }

  return {
    creditsUsedMicro: Math.round(
      (durationMilliseconds / MILLISECONDS_PER_HOUR) *
        CALL_RECORDING_MICRO_CREDITS_PER_HOUR,
    ),
    quantityMinutes: Math.max(
      1,
      Math.round(durationMilliseconds / MILLISECONDS_PER_MINUTE),
    ),
  };
};
