import { CoreApiClient } from 'twenty-client-sdk/core';

export async function createPostCard(data: {
  name: string;
  content?: string;
  status?: string;
}): Promise<string> {
  const client = new CoreApiClient();
  const res = await client.mutation({
    createPostCard: {
      __args: { data },
      id: true,
    },
  });

  return res.createPostCard.id;
}

export async function deletePostCard(id: string): Promise<void> {
  const client = new CoreApiClient();
  await client.mutation({
    destroyPostCard: {
      __args: { id },
      id: true,
    },
  });
}
