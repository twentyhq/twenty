import { CALL_RECORDING_STATUS } from 'src/logic-functions/constants/call-recording-status';

// Recall webhook deliveries are not ordered; a late status event must never
// move a recording backwards in its lifecycle.
const CALL_RECORDING_STATUS_PROGRESSION: Record<string, number> = {
  [CALL_RECORDING_STATUS.SCHEDULED]: 0,
  [CALL_RECORDING_STATUS.JOINING]: 1,
  [CALL_RECORDING_STATUS.RECORDING]: 2,
  [CALL_RECORDING_STATUS.PROCESSING]: 3,
  [CALL_RECORDING_STATUS.FAILED_UNKNOWN]: 4,
  [CALL_RECORDING_STATUS.COMPLETED]: 5,
};

export const isCallRecordingStatusDowngrade = ({
  fromStatus,
  toStatus,
}: {
  fromStatus: string | null | undefined;
  toStatus: string;
}): boolean => {
  const fromRank =
    fromStatus === null || fromStatus === undefined
      ? undefined
      : CALL_RECORDING_STATUS_PROGRESSION[fromStatus];
  const toRank = CALL_RECORDING_STATUS_PROGRESSION[toStatus];

  if (fromRank === undefined || toRank === undefined) {
    return false;
  }

  return toRank < fromRank;
};
