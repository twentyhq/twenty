import { CallRecorderRecordMyMeetingsChoice } from 'src/constants/call-recorder-record-my-meetings-choice';

export const CALL_RECORDER_RECORD_MY_MEETINGS_OPTIONS = [
  {
    label: 'External meetings',
    value: CallRecorderRecordMyMeetingsChoice.EXTERNAL_MEETINGS,
  },
  {
    label: 'All meetings',
    value: CallRecorderRecordMyMeetingsChoice.ALL_MEETINGS,
  },
  { label: 'None', value: CallRecorderRecordMyMeetingsChoice.NONE },
];
