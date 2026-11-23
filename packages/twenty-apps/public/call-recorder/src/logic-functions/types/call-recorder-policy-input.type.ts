import { type CallRecorderPreference } from 'src/constants/call-recorder-preference';

export type CallRecorderPolicyInput = {
  isCalendarBotSchedulingEnabled: boolean;
  callRecorderPreference: CallRecorderPreference | undefined;
  ownerUserWorkspaceIds: string[];
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  conferenceLinkUrl: string | undefined;
};
