import { type CallRecorderPreference } from 'src/constants/call-recorder-preference';

export type CallRecorderPolicyInput = {
  callRecorderPreference: CallRecorderPreference | undefined;
  isAutoRecordEnabled: boolean;
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  conferenceLinkUrl: string | undefined;
};
