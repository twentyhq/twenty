import {
  CALL_RECORDING_STATUS,
  type CallRecordingStatus,
} from 'src/logic-functions/constants/call-recording-status';

// Recall webhook deliveries are not ordered; a late status event must never
// move a recording backwards in its lifecycle.
const CALL_RECORDING_STATUS_PROGRESSION: Record<CallRecordingStatus, number> = {
  [CALL_RECORDING_STATUS.SCHEDULED]: 0,
  [CALL_RECORDING_STATUS.JOINING]: 1,
  [CALL_RECORDING_STATUS.RECORDING]: 2,
  [CALL_RECORDING_STATUS.PROCESSING]: 3,
  [CALL_RECORDING_STATUS.FAILED_UNKNOWN]: 4,
  [CALL_RECORDING_STATUS.COMPLETED]: 5,
};

const getCallRecordingStatusRank = (status: string): number | undefined =>
  status in CALL_RECORDING_STATUS_PROGRESSION
    ? CALL_RECORDING_STATUS_PROGRESSION[status as CallRecordingStatus]
    : undefined;

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
      : getCallRecordingStatusRank(fromStatus);
  const toRank = getCallRecordingStatusRank(toStatus);

  if (fromRank === undefined || toRank === undefined) {
    return false;
  }

  return toRank < fromRank;
};
