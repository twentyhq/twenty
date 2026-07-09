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

const createCompany = async (client: CoreApiClient): Promise<string> => {
  const result = await client.mutation({
    createCompany: {
      __args: { data: { name: `[test-last-contact] company ${Date.now()}` } },
      id: true,
    },
  });

  return requireId(result.createCompany?.id, 'createCompany');
};

const createOpportunity = async (
  client: CoreApiClient,
  {
    pointOfContactId,
    companyId,
  }: { pointOfContactId?: string; companyId?: string },
): Promise<string> => {
  const result = await client.mutation({
    createOpportunity: {
      __args: {
        data: {
          name: `[test-last-contact] opportunity ${Date.now()}`,
          ...(pointOfContactId ? { pointOfContactId } : {}),
          ...(companyId ? { companyId } : {}),
        },
      },
      id: true,
    },
  });

  return requireId(result.createOpportunity?.id, 'createOpportunity');
};

const setPersonCompany = async (
  client: CoreApiClient,
  { personId, companyId }: { personId: string; companyId: string },
): Promise<void> => {
  await client.mutation({
    updatePerson: {
      __args: { id: personId, data: { companyId } },
      id: true,
    },
  });
};

type RelatedLastContact = {
  lastContactAt: string | null;
  lastContactItemMessageId: string | null;
  lastContactItemCalendarEventId: string | null;
};

const getRelatedLastContact = async (
  client: CoreApiClient,
  objectNameSingular: 'company' | 'opportunity',
  recordId: string,
): Promise<RelatedLastContact> => {
  const result = await client.query({
    [objectNameSingular]: {
      __args: { filter: { id: { eq: recordId } } },
      id: true,
      lastContactAt: true,
      lastContactItemMessage: { id: true },
      lastContactItemCalendarEvent: { id: true },
    },
  });

  const record = result[objectNameSingular] as {
    lastContactAt?: string | null;
    lastContactItemMessage?: { id: string } | null;
    lastContactItemCalendarEvent?: { id: string } | null;
  } | null;

  return {
    lastContactAt: record?.lastContactAt ?? null,
    lastContactItemMessageId: record?.lastContactItemMessage?.id ?? null,
    lastContactItemCalendarEventId:
      record?.lastContactItemCalendarEvent?.id ?? null,
  };
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

let cachedWorkspaceMemberId: string | undefined;
let cachedMessageChannelId: string | undefined;

const getWorkspaceMemberId = async (
  client: CoreApiClient,
): Promise<string> => {
  if (cachedWorkspaceMemberId) {
    return cachedWorkspaceMemberId;
  }

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

  cachedWorkspaceMemberId = workspaceMemberId;

  return workspaceMemberId;
};

const getAnyMessageChannelId = async (
  client: CoreApiClient,
): Promise<string> => {
  if (cachedMessageChannelId) {
    return cachedMessageChannelId;
  }

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

  cachedMessageChannelId = messageChannelId;

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
  lastOutboundAt: string | null;
  lastInboundAt: string | null;
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
      lastOutboundAt: true,
      lastInboundAt: true,
      lastContactItemMessage: { id: true },
      lastContactItemCalendarEvent: { id: true },
      lastEmail: { id: true },
      lastMeeting: { id: true },
    },
  });

  const person = result.person as {
    lastContactAt?: string | null;
    lastContactById?: string | null;
    lastOutboundAt?: string | null;
    lastInboundAt?: string | null;
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
    lastOutboundAt: person?.lastOutboundAt ?? null,
    lastInboundAt: person?.lastInboundAt ?? null,
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
    lastOutboundAt: string | null;
    lastInboundAt: string | null;
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
  expect(asTime(actual.lastOutboundAt)).toBe(asTime(expected.lastOutboundAt));
  expect(asTime(actual.lastInboundAt)).toBe(asTime(expected.lastInboundAt));
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
  const createdOpportunityIds: string[] = [];
  const createdCompanyIds: string[] = [];

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

    for (const id of createdMessageParticipantIds) {
      await client
        .mutation({ destroyMessageParticipant: { __args: { id }, id: true } })
        .catch(() => {});
    }
    createdMessageParticipantIds.length = 0;

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

    for (const id of createdOpportunityIds) {
      await client
        .mutation({ destroyOpportunity: { __args: { id }, id: true } })
        .catch(() => {});
    }
    createdOpportunityIds.length = 0;

    for (const id of createdPersonIds) {
      await client
        .mutation({ destroyPerson: { __args: { id }, id: true } })
        .catch(() => {});
    }
    createdPersonIds.length = 0;

    for (const id of createdCompanyIds) {
      await client
        .mutation({ destroyCompany: { __args: { id }, id: true } })
        .catch(() => {});
    }
    createdCompanyIds.length = 0;
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
      lastOutboundAt: receivedAt,
      lastInboundAt: null,
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
      lastOutboundAt: null,
      lastInboundAt: receivedAt,
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
      lastOutboundAt: startsAt,
      lastInboundAt: startsAt,
      lastEmailId: null,
      lastMeetingId: calendarEventId,
    });
  });

  it('computes columns through an inbound email, then a later meeting, then a later outbound email', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const inboundAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();
    const meetingAt = new Date(Date.now() - 4 * DAY_IN_MS).toISOString();
    const outboundAt = new Date(Date.now() - 3 * DAY_IN_MS).toISOString();

    const inboundMessageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: inboundAt,
      direction: 'inbound',
    });

    expectColumns(await getPersonLastContact(client, personId), {
      lastContactAt: inboundAt,
      lastContactById: workspaceMemberId,
      itemMessageId: inboundMessageId,
      itemCalendarEventId: null,
      lastOutboundAt: null,
      lastInboundAt: inboundAt,
      lastEmailId: inboundMessageId,
      lastMeetingId: null,
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
      lastOutboundAt: meetingAt,
      lastInboundAt: meetingAt,
      lastEmailId: inboundMessageId,
      lastMeetingId: calendarEventId,
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
      lastOutboundAt: outboundAt,
      lastInboundAt: meetingAt,
      lastEmailId: outboundMessageId,
      lastMeetingId: calendarEventId,
    });
  });

  it("sets the company and opportunity last contact from a related person's email", async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const companyId = await createCompany(client);
    createdCompanyIds.push(companyId);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    await setPersonCompany(client, { personId, companyId });
    const opportunityId = await createOpportunity(client, {
      pointOfContactId: personId,
      companyId,
    });
    createdOpportunityIds.push(opportunityId);
    const receivedAt = new Date(Date.now() - 2 * DAY_IN_MS).toISOString();

    const messageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt,
      direction: 'outbound',
    });

    const companyContact = await getRelatedLastContact(
      client,
      'company',
      companyId,
    );
    expect(asTime(companyContact.lastContactAt)).toBe(asTime(receivedAt));
    expect(companyContact.lastContactItemMessageId).toBe(messageId);
    expect(companyContact.lastContactItemCalendarEventId).toBeNull();

    const opportunityContact = await getRelatedLastContact(
      client,
      'opportunity',
      opportunityId,
    );
    expect(asTime(opportunityContact.lastContactAt)).toBe(asTime(receivedAt));
    expect(opportunityContact.lastContactItemMessageId).toBe(messageId);
  });

  it("lets a later meeting supersede an email on the company's last contact", async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const companyId = await createCompany(client);
    createdCompanyIds.push(companyId);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    await setPersonCompany(client, { personId, companyId });
    const emailAt = new Date(Date.now() - 3 * DAY_IN_MS).toISOString();
    const meetingAt = new Date(Date.now() - 2 * DAY_IN_MS).toISOString();

    await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: emailAt,
      direction: 'outbound',
    });
    const calendarEventId = await recordMeeting({
      personId,
      workspaceMemberId,
      startsAt: meetingAt,
    });

    const companyContact = await getRelatedLastContact(
      client,
      'company',
      companyId,
    );
    expect(asTime(companyContact.lastContactAt)).toBe(asTime(meetingAt));
    expect(companyContact.lastContactItemCalendarEventId).toBe(calendarEventId);
    expect(companyContact.lastContactItemMessageId).toBeNull();
  });

  it('does not overwrite a company last contact with an older interaction', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const companyId = await createCompany(client);
    createdCompanyIds.push(companyId);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    await setPersonCompany(client, { personId, companyId });
    const newerAt = new Date(Date.now() - DAY_IN_MS).toISOString();
    const olderAt = new Date(Date.now() - 3 * DAY_IN_MS).toISOString();

    const newerMessageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: newerAt,
      direction: 'outbound',
    });
    await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: olderAt,
      direction: 'inbound',
    });

    const companyContact = await getRelatedLastContact(
      client,
      'company',
      companyId,
    );
    expect(asTime(companyContact.lastContactAt)).toBe(asTime(newerAt));
    expect(companyContact.lastContactItemMessageId).toBe(newerMessageId);
  });

  it('lets a later meeting supersede an earlier outbound email', async () => {
    const workspaceMemberId = await getWorkspaceMemberId(client);
    const personId = await createPerson(client);
    createdPersonIds.push(personId);
    const emailAt = new Date(Date.now() - 5 * DAY_IN_MS).toISOString();
    const meetingAt = new Date(Date.now() - 4 * DAY_IN_MS).toISOString();

    const messageId = await recordEmail({
      personId,
      workspaceMemberId,
      receivedAt: emailAt,
      direction: 'outbound',
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
      lastOutboundAt: meetingAt,
      lastInboundAt: meetingAt,
      lastEmailId: messageId,
      lastMeetingId: calendarEventId,
    });
  });
});
