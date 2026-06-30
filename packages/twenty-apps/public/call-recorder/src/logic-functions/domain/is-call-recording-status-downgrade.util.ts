import { isUndefined } from '@sniptt/guards';

import { CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';

// Deliveries are unordered; a late event must never move status backwards.
const CALL_RECORDING_STATUS_PROGRESSION: Record<CallRecordingStatus, number> = {
  [CallRecordingStatus.SCHEDULED]: 0,
  [CallRecordingStatus.JOINING]: 1,
  [CallRecordingStatus.RECORDING]: 2,
  [CallRecordingStatus.PROCESSING]: 3,
  [CallRecordingStatus.FAILED]: 4,
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
  fromStatus: string | undefined;
  toStatus: string;
}): boolean => {
  const fromRank = isUndefined(fromStatus)
    ? undefined
    : getCallRecordingStatusRank(fromStatus);
  const toRank = getCallRecordingStatusRank(toStatus);

  if (isUndefined(fromRank) || isUndefined(toRank)) {
    return false;
  }

  return toRank < fromRank;
};
