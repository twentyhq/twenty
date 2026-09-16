import { isUndefined } from '@sniptt/guards';
import { UNAVAILABLE_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/UNAVAILABLE_CALL_RECORDING_STATUSES';

export const isUnavailableCallRecordingStatus = (
  status: string | undefined,
): boolean =>
  !isUndefined(status) && UNAVAILABLE_CALL_RECORDING_STATUSES.includes(status);
