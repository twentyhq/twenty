import { CallRecordingStatus } from 'src/logic-functions/constants/CallRecordingStatus';
import { isCallRecordingStatusDowngrade } from 'src/logic-functions/domain/utils/isCallRecordingStatusDowngrade';

export const getAllowedPreviousCallRecordingStatuses = (
  toStatus: CallRecordingStatus,
): CallRecordingStatus[] =>
  Object.values(CallRecordingStatus).filter(
    (fromStatus) => !isCallRecordingStatusDowngrade({ fromStatus, toStatus }),
  );
