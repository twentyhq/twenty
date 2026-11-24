import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const MEMBER_RECORDING_PREFERENCE_OPTIONS: {
  label: string;
  value: MemberRecordingPreference;
}[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Internal', value: 'INTERNAL' },
  { label: 'External', value: 'EXTERNAL' },
  { label: 'None', value: 'NONE' },
];
