import { STANDARD_OBJECT_FIELDS, STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

const { calendarEvent, calendarEventTarget, message, messageThread } =
  STANDARD_OBJECT_FIELDS;

// Frozen copy of what the standard application declares for these objects in
// 2.44. Targets keep their readability and only gain discoverable fields.
export const DISCOVERABLE_EMAIL_AND_CALENDAR_OBJECTS = [
  {
    universalIdentifier: STANDARD_OBJECTS.messageThread.universalIdentifier,
    readability: MetadataReadability.DISCOVERABLE,
    readabilityParentFieldUniversalIdentifiers: null,
    discoverableFieldUniversalIdentifiers: [
      messageThread.messages.universalIdentifier,
      messageThread.messageChannelMessageAssociations.universalIdentifier,
      messageThread.messageThreadTargets.universalIdentifier,
    ],
  },
  {
    universalIdentifier: STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
    discoverableFieldUniversalIdentifiers: [
      STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
        .universalIdentifier,
      STANDARD_OBJECT_FIELDS.messageThreadTarget.targetPerson
        .universalIdentifier,
    ],
  },
  {
    universalIdentifier: STANDARD_OBJECTS.message.universalIdentifier,
    readability: MetadataReadability.INHERITED,
    readabilityParentFieldUniversalIdentifiers: [
      message.messageThread.universalIdentifier,
    ],
    discoverableFieldUniversalIdentifiers: [
      message.headerMessageId.universalIdentifier,
      message.messageThread.universalIdentifier,
      message.receivedAt.universalIdentifier,
      message.isDraft.universalIdentifier,
      message.messageParticipants.universalIdentifier,
      message.messageChannelMessageAssociations.universalIdentifier,
      message.messageCampaign.universalIdentifier,
    ],
  },
  {
    universalIdentifier: STANDARD_OBJECTS.calendarEvent.universalIdentifier,
    readability: MetadataReadability.DISCOVERABLE,
    readabilityParentFieldUniversalIdentifiers: null,
    discoverableFieldUniversalIdentifiers: [
      calendarEvent.startsAt.universalIdentifier,
      calendarEvent.endsAt.universalIdentifier,
      calendarEvent.isFullDay.universalIdentifier,
      calendarEvent.isCanceled.universalIdentifier,
      calendarEvent.externalCreatedAt.universalIdentifier,
      calendarEvent.externalUpdatedAt.universalIdentifier,
      calendarEvent.location.universalIdentifier,
      calendarEvent.iCalUid.universalIdentifier,
      calendarEvent.conferenceSolution.universalIdentifier,
      calendarEvent.conferenceLink.universalIdentifier,
      calendarEvent.calendarChannelEventAssociations.universalIdentifier,
      calendarEvent.calendarEventParticipants.universalIdentifier,
      calendarEvent.calendarEventTargets.universalIdentifier,
      calendarEvent.callRecordings.universalIdentifier,
    ],
  },
  {
    universalIdentifier: STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
    discoverableFieldUniversalIdentifiers: [
      calendarEventTarget.calendarEvent.universalIdentifier,
      calendarEventTarget.targetPerson.universalIdentifier,
    ],
  },
] as const satisfies {
  universalIdentifier: string;
  readability?: MetadataReadability;
  readabilityParentFieldUniversalIdentifiers?: readonly string[] | null;
  discoverableFieldUniversalIdentifiers: readonly string[];
}[];
