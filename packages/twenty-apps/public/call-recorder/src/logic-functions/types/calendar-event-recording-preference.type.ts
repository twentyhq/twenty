import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export type CalendarEventRecordingPreference = Extract<
  MemberRecordingPreference,
  'ALL' | 'NONE'
>;
