import { CALL_RECORDING_RECONCILIATION_LOOKBACK_DAYS } from 'src/logic-functions/constants/call-recording-reconciliation-lookback-days';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const getCallRecordingReconciliationLowerBound = (now: Date): Date =>
  new Date(
    now.getTime() -
      CALL_RECORDING_RECONCILIATION_LOOKBACK_DAYS * MILLISECONDS_PER_DAY,
  );
