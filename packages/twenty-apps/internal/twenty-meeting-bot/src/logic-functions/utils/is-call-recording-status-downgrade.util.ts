import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

// Recall webhook deliveries are not ordered; a late status event must never
// move a recording backwards in its lifecycle.
const CALL_RECORDING_STATUS_PROGRESSION: Record<CallRecordingStatus, number> = {
  [CallRecordingStatus.SCHEDULED]: 0,
  [CallRecordingStatus.JOINING]: 1,
  [CallRecordingStatus.RECORDING]: 2,
  [CallRecordingStatus.PROCESSING]: 3,
  [CallRecordingStatus.FAILED_UNKNOWN]: 4,
  [CallRecordingStatus.COMPLETED]: 5,
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
