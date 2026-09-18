import { isUndefined } from '@sniptt/guards';

import { type CallRecordingStatus } from 'src/logic-functions/constants/call-recording-status';
import { RECONCILABLE_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/reconcilable-call-recording-statuses';

export const isReconcilableCallRecordingStatus = (
  status: string | undefined,
): status is CallRecordingStatus =>
  !isUndefined(status) && RECONCILABLE_CALL_RECORDING_STATUSES.includes(status);
