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
  console.log('matching');
  const [object, action] = params.name.split('.');

  if (object !== SELF_HOSTING_USER_NAME_SINGULAR) {
    return;
  }
  console.log('matching2');

  if (!['created', 'updated'].includes(action)) {
    console.log('not a good action');
    return;
  }
  console.log('matching3');

  const email = params.properties.after.email?.primaryEmail;

  if (!email) {
    return;
  }
  console.log('matching4');

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
  console.log('matching5', people);

  let personId = people?.edges[0].node.id;
  console.log('matching55', personId);

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
  console.log('matching6');

  await client.mutation({
    updateSelfHostingUser: {
      __args: {
        id: params.properties.after.id,
        data: {
          person: { connect: { where: { id: personId } } },
        },
      },
      id: true,
    },
  });
  console.log('matching7');
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
