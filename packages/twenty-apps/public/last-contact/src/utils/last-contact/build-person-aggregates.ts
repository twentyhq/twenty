import { type CoreApiClient } from 'twenty-client-sdk/core';

import { collectCalendarOwners } from 'src/utils/last-contact/collect-calendar-owners';
import { collectEmailInteractions } from 'src/utils/last-contact/collect-email-interactions';
import { collectMeetingInteractions } from 'src/utils/last-contact/collect-meeting-interactions';
import { collectMessageMemberInfo } from 'src/utils/last-contact/collect-message-member-info';
import {
  foldEmail,
  foldMeeting,
} from 'src/utils/last-contact/fold-interactions';
import {
  type AggByPersonId,
  type PersonAgg,
} from 'src/utils/last-contact/types';

// Omitting personIds aggregates the whole workspace, which is what the
// post-install backfill needs; passing them scopes every query to a single
// batch of records.
export const buildPersonAggregates = async (
  client: CoreApiClient,
  personIds?: string[],
): Promise<AggByPersonId> => {
  const [emails, meetings] = await Promise.all([
    collectEmailInteractions(client, personIds),
    collectMeetingInteractions(client, personIds),
  ]);

  const messageIds = [...new Set(emails.map((email) => email.messageId))];
  const calendarEventIds = [
    ...new Set(meetings.map((meeting) => meeting.calendarEventId)),
  ];

  const [messageMemberInfo, calendarOwners] = await Promise.all([
    collectMessageMemberInfo(client, messageIds),
    collectCalendarOwners(client, calendarEventIds),
  ]);

  const aggByPersonId: AggByPersonId = new Map();
  const aggFor = (personId: string): PersonAgg => {
    const existing = aggByPersonId.get(personId);
    if (existing) {
      return existing;
    }
    const created: PersonAgg = {};
    aggByPersonId.set(personId, created);
    return created;
  };

  for (const email of emails) {
    foldEmail(
      aggFor(email.personId),
      email.receivedAt,
      email.messageId,
      messageMemberInfo.get(email.messageId),
    );
  }
  for (const meeting of meetings) {
    foldMeeting(
      aggFor(meeting.personId),
      meeting.startsAt,
      meeting.calendarEventId,
      calendarOwners.get(meeting.calendarEventId) ?? null,
    );
  }

  return aggByPersonId;
};
