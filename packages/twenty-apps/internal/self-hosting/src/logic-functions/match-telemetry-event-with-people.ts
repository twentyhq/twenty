import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk';
import { SELF_HOSTING_USER_NAME_SINGULAR } from 'src/objects/selfHostingUser.object';
import { type SelfHostingUser } from 'twenty-sdk/generated/core';
import { CoreApiClient } from 'twenty-sdk/generated';

// Logic function handler - rename and implement your logic
const handler = async (
  params: DatabaseEventPayload<
    | ObjectRecordCreateEvent<SelfHostingUser>
    | ObjectRecordUpdateEvent<SelfHostingUser>
  >,
) => {
  const [object, action] = params.name.split('.');

  if (object !== SELF_HOSTING_USER_NAME_SINGULAR) {
    return;
  }

  if (!['created', 'updated'].includes(action)) {
    return;
  }

  const email = params.properties.after.email?.primaryEmail;

  if (!email) {
    return;
  }

  const client = new CoreApiClient();

  const { people } = await client.query({
    people: {
      __args: {
        filter: {
          emails: {
            primaryEmail: { eq: email },
          },
        },
      },
      edges: {
        node: {
          id: true,
          selfHostingUsers: {
            edges: {
              node: {
                id: true,
              },
            },
          },
        },
      },
    },
  });

  let personId = people?.edges[0].node.id;

  if (!personId) {
    const person = await client.mutation({
      createPerson: {
        __args: {
          data: {
            emails: {
              primaryEmail: email,
            },
          },
        },
        id: true,
      },
    });

    personId = person.createPerson?.id;
  }

  await client.mutation({
    updateSelfHostingUser: {
      __args: {
        id: params.properties.after.id,
        data: {
          personId: { connect: { where: { id: personId } } },
        },
      },
      id: true,
    },
  });
};

export default defineLogicFunction({
  universalIdentifier: '87f0293a-997a-4c7b-85e2-e77462ccf0c5',
  name: 'match-telemetry-event-with-people',
  description: 'Add a description for your logic function',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: `${SELF_HOSTING_USER_NAME_SINGULAR}.*`,
  },
});
