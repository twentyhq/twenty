import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const MEMBER_RECORDING_PREFERENCE_OPTIONS: {
  label: string;
  value: MemberRecordingPreference;
}[] = [
  { label: 'All meetings', value: 'ALL' },
  { label: 'Internal meetings', value: 'INTERNAL' },
  { label: 'External meetings', value: 'EXTERNAL' },
  { label: 'None', value: 'NONE' },
];
