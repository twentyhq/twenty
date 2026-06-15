import { CoreApiClient } from 'twenty-client-sdk/core';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import onCalendarInteraction from 'src/logic-functions/on-calendar-interaction';
import onEmailInteraction from 'src/logic-functions/on-email-interaction';

const calendarHandler = onCalendarInteraction.config.handler as (
  event: unknown,
) => Promise<void>;
const emailHandler = onEmailInteraction.config.handler as (
  event: unknown,
) => Promise<void>;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const requireId = (id: string | null | undefined, what: string): string => {
  if (!id) throw new Error(`${what} returned no id`);
  return id;
};

const asTime = (value: string | null | undefined): number | null =>
  value ? new Date(value).getTime() : null;

const createPerson = async (client: CoreApiClient): Promise<string> => {
  const result = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: { firstName: 'Test', lastName: `LastContact-${Date.now()}` },
        },
      },
      id: true,
    },
  });

  return requireId(result.createPerson?.id, 'createPerson');
};

const createCalendarEvent = async (
  client: CoreApiClient,
  { startsAt, isCanceled = false }: { startsAt: string; isCanceled?: boolean },
): Promise<string> => {
  const result = await client.mutation({
    createCalendarEvent: {
      __args: {
        data: {
          title: `[test-last-contact] event ${Date.now()}`,
          startsAt,
          isCanceled,
        },
      },
      id: true,
    },
  });

  return requireId(result.createCalendarEvent?.id, 'createCalendarEvent');
};

const createCalendarEventParticipant = async (
  client: CoreApiClient,
  { calendarEventId, personId }: { calendarEventId: string; personId: string },
): Promise<string> => {
  const result = await client.mutation({
    createCalendarEventParticipant: {
      __args: { data: { calendarEventId, personId } },
      id: true,
    },
  });

  return requireId(
    result.createCalendarEventParticipant?.id,
    'createCalendarEventParticipant',
  );
};

const getAnyMessageChannelId = async (
  client: CoreApiClient,
): Promise<string> => {
  const result = await client.query({
    messageChannelMessageAssociations: {
      __args: { first: 1 },
      edges: { node: { id: true, messageChannelId: true } },
    },
  });

  const messageChannelId =
    result.messageChannelMessageAssociations?.edges?.[0]?.node
      ?.messageChannelId;

  if (!messageChannelId) {
    throw new Error(
      'No message channel found — run against a workspace with seeded messaging data',
    );
  }

  return messageChannelId;
};

const createMessage = async (
  client: CoreApiClient,
  { receivedAt }: { receivedAt: string },
): Promise<string> => {
  const result = await client.mutation({
    createMessage: {
      __args: {
        data: {
          subject: `[test-last-contact] message ${Date.now()}`,
          receivedAt,
        },
      },
      id: true,
    },
  });

  return requireId(result.createMessage?.id, 'createMessage');
};

const createMessageChannelAssociation = async (
  client: CoreApiClient,
  { messageId, messageChannelId }: { messageId: string; messageChannelId: string },
): Promise<string> => {
  const result = await client.mutation({
    createMessageChannelMessageAssociation: {
      __args: { data: { messageId, messageChannelId } },
      id: true,
    },
  });

  return requireId(
    result.createMessageChannelMessageAssociation?.id,
    'createMessageChannelMessageAssociation',
  );
};

const getPersonLastContactAt = async (
  client: CoreApiClient,
  personId: string,
): Promise<string | null> => {
  const result = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      id: true,
      lastContactAt: true,
    },
  });

  return (
    (result.person as { lastContactAt?: string | null })?.lastContactAt ?? null
  );
};

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const client = new MetadataApiClient();

    const result = await client.query({
      findManyApplications: {
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });

    const matchingApplication = result.findManyApplications.find(
      (application: { universalIdentifier: string }) =>
        application.universalIdentifier === APPLICATION_UNIVERSAL_IDENTIFIER,
    );

    expect(matchingApplication).toBeDefined();
  });
});

describe('last contact handlers', () => {
  let client: CoreApiClient;

  const createdParticipantIds: string[] = [];
  const createdCalendarEventIds: string[] = [];
  const createdMessageAssociationIds: string[] = [];
  const createdMessageIds: string[] = [];
  const createdPersonIds: string[] = [];

  const createLinkedMessage = async (receivedAt: string): Promise<string> => {
    const messageId = await createMessage(client, { receivedAt });
    createdMessageIds.push(messageId);
    const messageChannelId = await getAnyMessageChannelId(client);
    const associationId = await createMessageChannelAssociation(client, {
      messageId,
      messageChannelId,
    });
    createdMessageAssociationIds.push(associationId);

    return messageId;
  };

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    for (const id of createdParticipantIds) {
      await client
        .mutation({
          destroyCalendarEventParticipant: { __args: { id }, id: true },
        })
        .catch(() => {});
    }
    createdParticipantIds.length = 0;

    for (const id of createdCalendarEventIds) {
      await client
        .mutation({ destroyCalendarEvent: { __args: { id }, id: true } })
        .catch(() => {});
    }
    createdCalendarEventIds.length = 0;

    for (const id of createdMessageAssociationIds) {
      await client
        .mutation({
          destroyMessageChannelMessageAssociation: { __args: { id }, id: true },
        })
        .catch(() => {});
    }
    createdMessageAssociationIds.length = 0;

    for (const id of createdMessageIds) {
      await client
        .mutation({ destroyMessage: { __args: { id }, id: true } })
        .catch(() => {});
    }
    createdMessageIds.length = 0;

    for (const id of createdPersonIds) {
      await client
        .mutation({ destroyPerson: { __args: { id }, id: true } })
        .catch(() => {});
    }
    createdPersonIds.length = 0;
  });

  it('should expose a lastContactAt field on people, unset by default', async () => {
    const personId = await createPerson(client);
    createdPersonIds.push(personId);

    expect(await getPersonLastContactAt(client, personId)).toBeNull();
  });

  it('should set lastContactAt to the event startsAt when a person attended a past calendar event', async () => {
    const startsAt = new Date(Date.now() - DAY_IN_MS).toISOString();
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const calendarEventId = await createCalendarEvent(client, { startsAt });
    createdCalendarEventIds.push(calendarEventId);
    const participantId = await createCalendarEventParticipant(client, {
      calendarEventId,
      personId,
    });
    createdParticipantIds.push(participantId);

    await calendarHandler({
      recordId: participantId,
      properties: {
        updatedFields: ['personId'],
        after: { id: participantId, personId },
      },
    });

    expect(asTime(await getPersonLastContactAt(client, personId))).toBe(
      asTime(startsAt),
    );
  });

  it('should not set lastContactAt when the calendar event is in the future', async () => {
    const startsAt = new Date(Date.now() + DAY_IN_MS).toISOString();
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const calendarEventId = await createCalendarEvent(client, { startsAt });
    createdCalendarEventIds.push(calendarEventId);
    const participantId = await createCalendarEventParticipant(client, {
      calendarEventId,
      personId,
    });
    createdParticipantIds.push(participantId);

    await calendarHandler({
      recordId: participantId,
      properties: {
        updatedFields: ['personId'],
        after: { id: participantId, personId },
      },
    });

    expect(await getPersonLastContactAt(client, personId)).toBeNull();
  });

  it('should not set lastContactAt when the past calendar event is canceled', async () => {
    const startsAt = new Date(Date.now() - DAY_IN_MS).toISOString();
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const calendarEventId = await createCalendarEvent(client, {
      startsAt,
      isCanceled: true,
    });
    createdCalendarEventIds.push(calendarEventId);
    const participantId = await createCalendarEventParticipant(client, {
      calendarEventId,
      personId,
    });
    createdParticipantIds.push(participantId);

    await calendarHandler({
      recordId: participantId,
      properties: {
        updatedFields: ['personId'],
        after: { id: participantId, personId },
      },
    });

    expect(await getPersonLastContactAt(client, personId)).toBeNull();
  });

  it('should set lastContactAt to the message receivedAt when a person is matched on an email', async () => {
    const receivedAt = new Date(Date.now() - DAY_IN_MS).toISOString();
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const messageId = await createLinkedMessage(receivedAt);

    await emailHandler({
      recordId: 'unused-participant-id',
      properties: {
        updatedFields: ['personId'],
        after: { id: 'unused-participant-id', personId, messageId },
      },
    });

    expect(asTime(await getPersonLastContactAt(client, personId))).toBe(
      asTime(receivedAt),
    );
  });

  it('should not overwrite a newer lastContactAt with an older interaction', async () => {
    const newerReceivedAt = new Date(Date.now() - DAY_IN_MS).toISOString();
    const olderReceivedAt = new Date(Date.now() - 3 * DAY_IN_MS).toISOString();
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const newerMessageId = await createLinkedMessage(newerReceivedAt);
    const olderMessageId = await createLinkedMessage(olderReceivedAt);

    await emailHandler({
      recordId: 'unused-participant-id',
      properties: {
        updatedFields: ['personId'],
        after: {
          id: 'unused-participant-id',
          personId,
          messageId: newerMessageId,
        },
      },
    });
    await emailHandler({
      recordId: 'unused-participant-id',
      properties: {
        updatedFields: ['personId'],
        after: {
          id: 'unused-participant-id',
          personId,
          messageId: olderMessageId,
        },
      },
    });

    expect(asTime(await getPersonLastContactAt(client, personId))).toBe(
      asTime(newerReceivedAt),
    );
  });
});
