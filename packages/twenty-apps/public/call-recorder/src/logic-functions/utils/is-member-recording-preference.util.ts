import { MEMBER_RECORDING_PREFERENCES } from 'src/logic-functions/constants/member-recording-preferences';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const isMemberRecordingPreference = (
  value: string | undefined,
): value is MemberRecordingPreference =>
  MEMBER_RECORDING_PREFERENCES.some((preference) => preference === value);
