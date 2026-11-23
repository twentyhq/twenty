import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

// A member whose choice cannot be read is never recorded on their own account.
export const UNREADABLE_MEMBER_RECORDING_PREFERENCE: MemberRecordingPreference =
  'NONE';
