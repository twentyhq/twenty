import { type CallRecorderPreference } from 'src/constants/call-recorder-preference';

export type CallRecorderPolicyInput = {
  callRecorderPreference: CallRecorderPreference | undefined;
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  conferenceLinkUrl: string | undefined;
};
