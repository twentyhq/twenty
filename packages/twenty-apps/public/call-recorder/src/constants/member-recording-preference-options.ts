import { msg } from 'twenty-sdk/front-component';

import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export const MEMBER_RECORDING_PREFERENCE_OPTIONS: {
  label: ReturnType<typeof msg>;
  value: MemberRecordingPreference;
}[] = [
  { label: msg('All meetings'), value: 'ALL' },
  { label: msg('Internal meetings'), value: 'INTERNAL' },
  { label: msg('External meetings'), value: 'EXTERNAL' },
  { label: msg('None'), value: 'NONE' },
];
