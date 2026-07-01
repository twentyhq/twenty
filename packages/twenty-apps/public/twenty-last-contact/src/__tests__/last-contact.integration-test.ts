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
  {
    calendarEventId,
    personId,
    workspaceMemberId,
    isOrganizer,
  }: {
    calendarEventId: string;
    personId?: string;
    workspaceMemberId?: string;
    isOrganizer?: boolean;
  },
): Promise<string> => {
  const result = await client.mutation({
    createCalendarEventParticipant: {
      __args: {
        data: {
          calendarEventId,
          ...(personId ? { personId } : {}),
          ...(workspaceMemberId ? { workspaceMemberId } : {}),
          ...(isOrganizer !== undefined ? { isOrganizer } : {}),
        },
      },
      id: true,
    },
  });

  return requireId(
    result.createCalendarEventParticipant?.id,
    'createCalendarEventParticipant',
  );
};

const getWorkspaceMemberId = async (
  client: CoreApiClient,
): Promise<string> => {
  const result = await client.query({
    workspaceMembers: {
      __args: { first: 1 },
      edges: { node: { id: true } },
    },
  });

  const workspaceMemberId =
    result.workspaceMembers?.edges?.[0]?.node?.id;

  if (!workspaceMemberId) {
    throw new Error('No workspace member found in the test workspace');
  }

  return workspaceMemberId;
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

const createMessageParticipant = async (
  client: CoreApiClient,
  {
    messageId,
    role = 'FROM',
    personId,
    workspaceMemberId,
  }: {
    messageId: string;
    role?: string;
    personId?: string;
    workspaceMemberId?: string;
  },
): Promise<string> => {
  const result = await client.mutation({
    createMessageParticipant: {
      __args: {
        data: {
          messageId,
          role,
          ...(personId ? { personId } : {}),
          ...(workspaceMemberId ? { workspaceMemberId } : {}),
        },
      },
      id: true,
    },
  });

  return requireId(
    result.createMessageParticipant?.id,
    'createMessageParticipant',
  );
};

type PersonLastContact = {
  lastContactAt: string | null;
  lastContactById: string | null;
  lastContactItemMessageId: string | null;
  lastContactItemCalendarEventId: string | null;
  lastContactedAt: string | null;
  lastHeardFromAt: string | null;
  lastEmailId: string | null;
  lastMeetingId: string | null;
};

const getPersonLastContact = async (
  client: CoreApiClient,
  personId: string,
): Promise<PersonLastContact> => {
  const result = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      id: true,
      lastContactAt: true,
      lastContactById: true,
      lastContactedAt: true,
      lastHeardFromAt: true,
      lastContactItemMessage: { id: true },
      lastContactItemCalendarEvent: { id: true },
      lastEmail: { id: true },
      lastMeeting: { id: true },
    },
  });

  const person = result.person as {
    lastContactAt?: string | null;
    lastContactById?: string | null;
    lastContactedAt?: string | null;
    lastHeardFromAt?: string | null;
    lastContactItemMessage?: { id: string } | null;
    lastContactItemCalendarEvent?: { id: string } | null;
    lastEmail?: { id: string } | null;
    lastMeeting?: { id: string } | null;
  } | null;

  return {
    lastContactAt: person?.lastContactAt ?? null,
    lastContactById: person?.lastContactById ?? null,
    lastContactItemMessageId: person?.lastContactItemMessage?.id ?? null,
    lastContactItemCalendarEventId:
      person?.lastContactItemCalendarEvent?.id ?? null,
    lastContactedAt: person?.lastContactedAt ?? null,
    lastHeardFromAt: person?.lastHeardFromAt ?? null,
    lastEmailId: person?.lastEmail?.id ?? null,
    lastMeetingId: person?.lastMeeting?.id ?? null,
  };
};

const expectColumns = (
  actual: PersonLastContact,
  expected: {
    lastContactAt: string | null;
    lastContactById: string | null;
    itemMessageId: string | null;
    itemCalendarEventId: string | null;
    lastContactedAt: string | null;
    lastHeardFromAt: string | null;
    lastEmailId: string | null;
    lastMeetingId: string | null;
  },
): void => {
  expect(asTime(actual.lastContactAt)).toBe(asTime(expected.lastContactAt));
  expect(actual.lastContactById).toBe(expected.lastContactById);
  expect(actual.lastContactItemMessageId).toBe(expected.itemMessageId);
  expect(actual.lastContactItemCalendarEventId).toBe(
    expected.itemCalendarEventId,
  );
  expect(asTime(actual.lastContactedAt)).toBe(asTime(expected.lastContactedAt));
  expect(asTime(actual.lastHeardFromAt)).toBe(asTime(expected.lastHeardFromAt));
  expect(actual.lastEmailId).toBe(expected.lastEmailId);
  expect(actual.lastMeetingId).toBe(expected.lastMeetingId);
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
  const createdMessageParticipantIds: string[] = [];
  const createdCalendarEventIds: string[] = [];
  const createdMessageAssociationIds: string[] = [];
  const createdMessageIds: string[] = [];
  const createdPersonIds: string[] = [];

  const createLinkedMessage = async (
    receivedAt: string,
    personId: string,
  ): Promise<string> => {
    const messageId = await createMessage(client, { receivedAt });
    createdMessageIds.push(messageId);
    const messageChannelId = await getAnyMessageChannelId(client);
    const associationId = await createMessageChannelAssociation(client, {
      messageId,
      messageChannelId,
    });
    createdMessageAssociationIds.push(associationId);
    const participantId = await createMessageParticipant(client, {
      messageId,
      personId,
    });
    createdMessageParticipantIds.push(participantId);

    return messageId;
  };

  const recordEmail = async ({
    personId,
    workspaceMemberId,
    receivedAt,
    direction,
  }: {
    personId: string;
    workspaceMemberId: string;
    receivedAt: string;
    direction: 'outbound' | 'inbound';
  }): Promise<string> => {
    const messageId = await createMessage(client, { receivedAt });
    createdMessageIds.push(messageId);
    const messageChannelId = await getAnyMessageChannelId(client);
    createdMessageAssociationIds.push(
      await createMessageChannelAssociation(client, {
        messageId,
        messageChannelId,
      }),
    );

    const sender =
      direction === 'outbound' ? { workspaceMemberId } : { personId };
    const recipient =
      direction === 'outbound' ? { personId } : { workspaceMemberId };

    createdMessageParticipantIds.push(
      await createMessageParticipant(client, {
        messageId,
        role: 'FROM',
        ...sender,
      }),
    );
    createdMessageParticipantIds.push(
      await createMessageParticipant(client, {
        messageId,
        role: 'TO',
        ...recipient,
      }),
    );

    await emailHandler({
      recordId: 'unused-participant-id',
      properties: {
        updatedFields: ['personId'],
        after: { id: 'unused-participant-id', personId, messageId },
      },
    });

    return messageId;
  };

  const recordMeeting = async ({
    personId,
    workspaceMemberId,
    startsAt,
  }: {
    personId: string;
    workspaceMemberId: string;
    startsAt: string;
  }): Promise<string> => {
    const calendarEventId = await createCalendarEvent(client, { startsAt });
    createdCalendarEventIds.push(calendarEventId);
    createdParticipantIds.push(
      await createCalendarEventParticipant(client, {
        calendarEventId,
        personId,
      }),
    );
    createdParticipantIds.push(
      await createCalendarEventParticipant(client, {
        calendarEventId,
        workspaceMemberId,
        isOrganizer: true,
      }),
    );

    await calendarHandler({
      recordId: 'unused-participant-id',
      properties: {
        updatedFields: ['personId'],
        after: { id: 'unused-participant-id', personId },
      },
    });

    return calendarEventId;
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

    for (const id of createdMessageParticipantIds) {
      await client
        .mutation({
          destroyMessageParticipant: { __args: { id }, id: true },
        })
        .catch(() => {});
    }
    createdMessageParticipantIds.length = 0;

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

    expect(
      (await getPersonLastContact(client, personId)).lastContactAt,
    ).toBeNull();
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

    const lastContact = await getPersonLastContact(client, personId);
    expect(asTime(lastContact.lastContactAt)).toBe(asTime(startsAt));
    expect(lastContact.lastContactItemCalendarEventId).toBe(calendarEventId);
    expect(lastContact.lastContactItemMessageId).toBeNull();
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

    expect(
      (await getPersonLastContact(client, personId)).lastContactAt,
    ).toBeNull();
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

    expect(
      (await getPersonLastContact(client, personId)).lastContactAt,
    ).toBeNull();
  });

  it('should set lastContactAt to the message receivedAt when a person is matched on an email', async () => {
    const receivedAt = new Date(Date.now() - DAY_IN_MS).toISOString();
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const messageId = await createLinkedMessage(receivedAt, personId);

    await emailHandler({
      recordId: 'unused-participant-id',
      properties: {
        updatedFields: ['personId'],
        after: { id: 'unused-participant-id', personId, messageId },
      },
    });

    const lastContact = await getPersonLastContact(client, personId);
    expect(asTime(lastContact.lastContactAt)).toBe(asTime(receivedAt));
    expect(lastContact.lastContactItemMessageId).toBe(messageId);
    expect(lastContact.lastContactItemCalendarEventId).toBeNull();
  });

  it('should not overwrite a newer lastContactAt with an older interaction', async () => {
    const newerReceivedAt = new Date(Date.now() - DAY_IN_MS).toISOString();
    const olderReceivedAt = new Date(Date.now() - 3 * DAY_IN_MS).toISOString();
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const newerMessageId = await createLinkedMessage(newerReceivedAt, personId);
    const olderMessageId = await createLinkedMessage(olderReceivedAt, personId);

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

    expect(
      asTime((await getPersonLastContact(client, personId)).lastContactAt),
    ).toBe(asTime(newerReceivedAt));
  });

  it('computes all columns for a single sent (outbound) email', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const receivedAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();

    const messageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt,
      direction: 'outbound',
    });

    expectColumns(await getPersonLastContact(client, personId), {
      lastContactAt: receivedAt,
      lastContactById: workspaceMemberId,
      itemMessageId: messageId,
      itemCalendarEventId: null,
      lastContactedAt: receivedAt,
      lastHeardFromAt: null,
      lastEmailId: messageId,
      lastMeetingId: null,
    });
  });

  it('computes all columns for a single received (inbound) email', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const receivedAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();

    const messageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt,
      direction: 'inbound',
    });

    expectColumns(await getPersonLastContact(client, personId), {
      lastContactAt: receivedAt,
      lastContactById: workspaceMemberId,
      itemMessageId: messageId,
      itemCalendarEventId: null,
      lastContactedAt: null,
      lastHeardFromAt: receivedAt,
      lastEmailId: messageId,
      lastMeetingId: null,
    });
  });

  it('computes all columns for a single meeting (counts as both directions)', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const startsAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();

    const calendarEventId = await recordMeeting({
      personId,
      workspaceMemberId,
      startsAt,
    });

    expectColumns(await getPersonLastContact(client, personId), {
      lastContactAt: startsAt,
      lastContactById: workspaceMemberId,
      itemMessageId: null,
      itemCalendarEventId: calendarEventId,
      lastContactedAt: startsAt,
      lastHeardFromAt: startsAt,
      lastEmailId: null,
      lastMeetingId: calendarEventId,
    });
  });

  it('lets a later meeting supersede an earlier email', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const emailAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();
    const meetingAt = new Date(Date.now() - 4 * DAY_IN_MS).toISOString();

    const messageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: emailAt,
      direction: 'inbound',
    });
    const calendarEventId = await recordMeeting({
      personId,
      workspaceMemberId,
      startsAt: meetingAt,
    });

    expectColumns(await getPersonLastContact(client, personId), {
      lastContactAt: meetingAt,
      lastContactById: workspaceMemberId,
      itemMessageId: null,
      itemCalendarEventId: calendarEventId,
      lastContactedAt: meetingAt,
      lastHeardFromAt: meetingAt,
      lastEmailId: messageId,
      lastMeetingId: calendarEventId,
    });
  });

  it('lets a later email supersede an earlier meeting', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const meetingAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();
    const emailAt = new Date(Date.now() - 4 * DAY_IN_MS).toISOString();

    const calendarEventId = await recordMeeting({
      personId,
      workspaceMemberId,
      startsAt: meetingAt,
    });
    const messageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: emailAt,
      direction: 'outbound',
    });

    expectColumns(await getPersonLastContact(client, personId), {
      lastContactAt: emailAt,
      lastContactById: workspaceMemberId,
      itemMessageId: messageId,
      itemCalendarEventId: null,
      lastContactedAt: emailAt,
      lastHeardFromAt: meetingAt,
      lastEmailId: messageId,
      lastMeetingId: calendarEventId,
    });
  });

  it('tracks last outbound and last inbound from different emails', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const inboundAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();
    const outboundAt = new Date(Date.now() - 4 * DAY_IN_MS).toISOString();

    await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: inboundAt,
      direction: 'inbound',
    });
    const outboundMessageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: outboundAt,
      direction: 'outbound',
    });

    expectColumns(await getPersonLastContact(client, personId), {
      lastContactAt: outboundAt,
      lastContactById: workspaceMemberId,
      itemMessageId: outboundMessageId,
      itemCalendarEventId: null,
      lastContactedAt: outboundAt,
      lastHeardFromAt: inboundAt,
      lastEmailId: outboundMessageId,
      lastMeetingId: null,
    });
  });
});
