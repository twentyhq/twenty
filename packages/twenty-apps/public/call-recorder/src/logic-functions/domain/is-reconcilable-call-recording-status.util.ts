import { isUndefined } from '@sniptt/guards';

import { RECONCILABLE_CALL_RECORDING_STATUSES } from 'src/logic-functions/constants/reconcilable-call-recording-statuses';

export const isReconcilableCallRecordingStatus = (
  status: string | undefined,
): status is string =>
  !isUndefined(status) && RECONCILABLE_CALL_RECORDING_STATUSES.includes(status);
