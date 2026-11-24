import { type CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { type MemberRecordingPreference } from 'src/logic-functions/types/member-recording-preference.type';

export type CallRecorderPolicyInput = {
  isCalendarBotSchedulingEnabled: boolean;
  callRecorderPreference: CallRecorderPreference | undefined;
  ownerRecordingPreferences: MemberRecordingPreference[];
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  conferenceLinkUrl: string | undefined;
};
