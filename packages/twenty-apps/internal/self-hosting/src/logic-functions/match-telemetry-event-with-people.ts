import {
  defineLogicFunction,
  type DatabaseEventPayload,
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk';
import { SELF_HOSTING_USER_NAME_SINGULAR } from 'src/objects/selfHostingUser.object';
import { type SelfHostingUser } from 'twenty-sdk/generated/core';
import { CoreApiClient } from 'twenty-sdk/generated';

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
      edges: { node: { id: true } },
      __args: {
        filter: {
          emails: {
            primaryEmail: { eq: email },
          },
        },
      },
    },
  });

  let personId = people?.edges[0]?.node?.id;

  if (!personId) {
    const { createPerson } = await client.mutation({
      createPerson: {
        __args: {
          data: {
            name: {
              firstName: params.properties.after.name?.firstName,
              lastName: params.properties.after.name?.lastName,
            },
            emails: {
              primaryEmail: email,
            },
          },
        },
        id: true,
      },
    });

    personId = createPerson?.id;
  }

  await client.mutation({
    updateSelfHostingUser: {
      __args: {
        id: params.properties.after.id,
        data: {
          personId,
        },
      },
      id: true,
    },
  });
};

export default defineLogicFunction({
  universalIdentifier: '87f0293a-997a-4c7b-85e2-e77462ccf0c5',
  name: 'match-telemetry-event-with-people',
  description:
    'Matches self hosting users with existing people based on email address',
  timeoutSeconds: 10,
  handler,
  databaseEventTriggerSettings: {
    eventName: `${SELF_HOSTING_USER_NAME_SINGULAR}.*`,
  },
});
