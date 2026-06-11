import { CALL_RECORDING_MICRO_CREDITS_PER_HOUR } from 'src/logic-functions/constants/call-recording-micro-credits-per-hour';

const MILLISECONDS_PER_HOUR = 3_600_000;
const MILLISECONDS_PER_MINUTE = 60_000;

export type CallRecordingCharge = {
  creditsUsedMicro: number;
  quantityMinutes: number;
};

export const computeCallRecordingCharge = ({
  startedAt,
  endedAt,
}: {
  startedAt: string | null | undefined;
  endedAt: string | null | undefined;
}): CallRecordingCharge | null => {
  if (
    startedAt === null ||
    startedAt === undefined ||
    endedAt === null ||
    endedAt === undefined
  ) {
    return null;
  }

  const durationMilliseconds =
    new Date(endedAt).getTime() - new Date(startedAt).getTime();

  if (!Number.isFinite(durationMilliseconds) || durationMilliseconds <= 0) {
    return null;
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
