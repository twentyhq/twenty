import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk/define';

const SEED_POST_CARDS = [
  {
    name: 'Greetings from Paris',
    content: 'Wish you were here! The Eiffel Tower is breathtaking.',
  },
  {
    name: 'Hello from Tokyo',
    content: 'Cherry blossoms are in full bloom. Sending love!',
  },
];

const handler = async () => {
  const client = new CoreApiClient();

  await client.mutation({
    createPostCards: {
      __args: { data: SEED_POST_CARDS as any },
      id: true,
    },
  } as any);

  console.log(`Seeded ${SEED_POST_CARDS.length} post cards on install.`);
  return {};
};

export default definePostInstallLogicFunction({
  universalIdentifier: '852c6321-1563-4396-b7c5-9d370f3d30a9',
  name: 'post-install',
  description: 'Runs after installation to set up the application.',
  timeoutSeconds: 30,
  handler,
});
