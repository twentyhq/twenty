import { isUndefined } from '@sniptt/guards';

import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

type ComparableCallRecordingFieldName = keyof CallRecordingRecord &
  keyof CallRecordingUpdateFields;

const COMPARABLE_CALL_RECORDING_FIELDS: Record<
  ComparableCallRecordingFieldName,
  true
> = {
  title: true,
  status: true,
  recordingRequestStatus: true,
  startedAt: true,
  endedAt: true,
  calendarEventId: true,
  externalBotId: true,
  botScheduleAttemptedAt: true,
  botScheduleIdempotencyKey: true,
  externalRecordingId: true,
  callRecorderFailureReason: true,
};

const isComparableCallRecordingFieldName = (
  fieldName: string,
): fieldName is ComparableCallRecordingFieldName =>
  fieldName in COMPARABLE_CALL_RECORDING_FIELDS;

export const hasCallRecordingUpdateFieldChanges = ({
  callRecording,
  updateFields,
}: {
  callRecording: CallRecordingRecord;
  updateFields: CallRecordingUpdateFields;
}): boolean =>
  Object.entries(updateFields).some(([fieldName, updateFieldValue]) =>
    isComparableCallRecordingFieldName(fieldName)
      ? (callRecording[fieldName] ?? null) !== (updateFieldValue ?? null)
      : !isUndefined(updateFieldValue),
  );
