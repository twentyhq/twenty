import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const MEMBER_RECORDING_PREFERENCE_OPTIONS: {
  label: string;
  value: MemberRecordingPreference;
}[] = [
  { label: 'All my meetings', value: 'ALL' },
  { label: 'Only internal meetings', value: 'INTERNAL' },
  { label: 'Only external meetings', value: 'EXTERNAL' },
  { label: 'None of my meetings', value: 'NONE' },
];
