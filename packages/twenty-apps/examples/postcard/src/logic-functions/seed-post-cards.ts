import { CoreApiClient } from 'twenty-client-sdk/core';
import { definePostInstallLogicFunction } from 'twenty-sdk';

const POST_CARDS_TO_SEED = [
  {
    name: 'Greetings from Paris',
    content:
      'Wish you were here! The Eiffel Tower looks even better in person. - Alex',
  },
  {
    name: 'Hello from Tokyo',
    content:
      'The cherry blossoms are amazing this time of year. See you soon! - Sam',
  },
];

const handler = async (): Promise<{
  message: string;
  createdIds: string[];
}> => {
  console.log('Seeding 2 post cards...');
  const client = new CoreApiClient();

  const createdIds: string[] = [];

  for (const postCard of POST_CARDS_TO_SEED) {
    const { createPostCard } = await client.mutation({
      createPostCard: {
        __args: {
          data: {
            name: postCard.name,
            content: postCard.content,
          },
        },
        id: true,
      },
    });

    if (!createPostCard?.id) {
      throw new Error(`Failed to create post card "${postCard.name}"`);
    }

    createdIds.push(createPostCard.id);
  }

  console.log('Seeding complete!');
  return {
    message: `Seeded ${createdIds.length} post cards`,
    createdIds,
  };
};

export default definePostInstallLogicFunction({
  universalIdentifier: '9f3d8c21-b471-4a82-8e5c-6f3a7b8c9d01',
  name: 'seed-post-cards',
  description: 'Seeds the workspace with 2 sample post card records.',
  timeoutSeconds: 10,
  handler,
});
