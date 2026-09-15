// Domain read shape: wire composites are flattened and absence is undefined.
export type CallRecorderPolicyCalendarEventInput = {
  id: string;
  isCanceled: boolean;
  startsAt: string | undefined;
  endsAt: string | undefined;
  iCalUid: string | undefined;
  conferenceLinkUrl: string | undefined;
  callRecorderPreference: string | undefined;
};
