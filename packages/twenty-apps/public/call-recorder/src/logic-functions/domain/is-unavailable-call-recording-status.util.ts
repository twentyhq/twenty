import { isUndefined } from '@sniptt/guards';

import { UNAVAILABLE_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/unavailable-call-recording-statuses';

export const isUnavailableCallRecordingStatus = (
  status: string | undefined,
): boolean =>
  !isUndefined(status) && UNAVAILABLE_CALL_RECORDING_STATUSES.includes(status);
