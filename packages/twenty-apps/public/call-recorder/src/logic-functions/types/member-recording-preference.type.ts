import { type MEMBER_RECORDING_PREFERENCES } from 'src/logic-functions/constants/member-recording-preferences';

export type MemberRecordingPreference =
  (typeof MEMBER_RECORDING_PREFERENCES)[number];
