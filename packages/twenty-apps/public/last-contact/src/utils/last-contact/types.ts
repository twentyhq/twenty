export type EmailInteraction = {
  personId: string;
  messageId: string;
  receivedAt: string;
};

export type MeetingInteraction = {
  personId: string;
  calendarEventId: string;
  startsAt: string;
};

export type MessageMemberInfo = { ownerId: string; fromIsMember: boolean };

export type ContactItem = { kind: 'email' | 'meeting'; id: string };

export type LastContact = { at: string; item: ContactItem };

export type PersonAgg = {
  lastContactAt?: string;
  lastContactById?: string | null;
  item?: ContactItem;
  lastOutboundAt?: string;
  lastInboundAt?: string;
  lastEmail?: { at: string; id: string };
  lastMeeting?: { at: string; id: string };
};

export type AggByPersonId = Map<string, PersonAgg>;

export type RecordUpdateData = Record<string, string | null>;

export type RecordUpdate = { id: string; data: RecordUpdateData };
