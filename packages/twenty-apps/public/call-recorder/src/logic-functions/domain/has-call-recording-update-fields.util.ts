import { type CallRecordingUpdateFields } from 'src/logic-functions/types/call-recording-update-fields.type';

export const hasCallRecordingUpdateFields = (
  updateData: CallRecordingUpdateFields,
): boolean => Object.keys(updateData).length > 0;
