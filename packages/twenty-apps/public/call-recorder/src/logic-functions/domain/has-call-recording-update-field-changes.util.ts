import { type CallRecordingRecord } from 'src/logic-functions/types/call-recording-record.type';
import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const hasCallRecordingUpdateFieldChanges = ({
  callRecording,
  updateFields,
}: {
  callRecording: CallRecordingRecord;
  updateFields: CallRecordingUpdateFields;
}): boolean => {
  const currentFieldValues: Record<string, unknown> = callRecording;

  return Object.entries(updateFields).some(
    ([fieldName, updateFieldValue]) =>
      (currentFieldValues[fieldName] ?? null) !== (updateFieldValue ?? null),
  );
};
