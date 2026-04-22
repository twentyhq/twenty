import { DatabaseEventPayload, defineLogicFunction, ObjectRecordCreateEvent } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { calculateStatus } from '../shared/calculate-status';


const fetchMessageParticipants = async (messageId: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    messageParticipants: {
      __args: {
        filter: {
          messageId: {
            eq: messageId,
          },
        },
      },
      edges: {
        node: {
          personId: true,
        },
      },
    },
  });
  let people: string[] = [];
  if (result.messageParticipants === undefined) {
    return people;
  }
  for (const person of result.messageParticipants.edges) {
    if (person.node.personId !== undefined) {
      people.push(person.node.personId);
    }
  }
  return people;
};

const fetchRelatedCompany = async (personId: string) => {
  const client = new CoreApiClient();
  const result = await client.query({
    people: {
      __args: {
        filter: {
          id: {
            eq: personId,
          },
        },
      },
      edges: {
        node: {
          company: {
            id: true,
          },
        },
      },
    },
  });
  if (
    result.people === undefined ||
    result.people.edges[0].node.company === undefined
  ) {
    throw new Error(`Failed to fetch related company of person ${personId}`);
  }
  return result.people.edges[0].node.company.id;
};

const updateCompany = async (
  companyId: string,
  updateData: Record<string, string>,
) => {
  const client = new CoreApiClient();
  const result = await client.mutation({
    updateCompany: {
      __args: {
        id: companyId,
        data: updateData,
      },
      id: true,
    },
  });
  if (!result.updateCompany) {
    throw new Error(`Failed to update company ${companyId}`);
  }
};

const updatePerson = async (
  personId: string,
  updateData: Record<string, string>,
) => {
  const client = new CoreApiClient();
  const result = await client.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: updateData,
      },
      id: true,
    },
  });
  if (!result.updatePerson) {
    throw new Error(`Failed to update person ${personId}`);
  }
};

type Message = {
  receivedAt: string;
};

type MessageCreatedEvent = DatabaseEventPayload<
  ObjectRecordCreateEvent<Message>
>;

const handler = async (
  event: MessageCreatedEvent,
): Promise<object | undefined> => {
  const { properties, recordId } = event;
  const interactionStatus = calculateStatus(properties.after.receivedAt);
  const peopleIds: string[] = [];
  peopleIds.push(...(await fetchMessageParticipants(recordId)));
  const updateData = {
    lastInteraction: properties.after.receivedAt,
    interactionStatus: interactionStatus,
  };
  for (const person of peopleIds) {
    const companyId = await fetchRelatedCompany(person);
    await updatePerson(person, updateData);
    await updateCompany(companyId, updateData);
  }
  return {};
};

export default defineLogicFunction({
  universalIdentifier: '9bfcb3e4-9119-4b65-b6e9-d395d0764ce5',
  name: 'on-message-updated',
  description: 'Triggered when message is updated',
  timeoutSeconds: 5,
  handler,
  databaseEventTriggerSettings: {
     eventName: 'message.updated',
  },
});
