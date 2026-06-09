import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updatePeopleStatus = async (
  client: CoreApiClient,
  recordIds: string[],
  data: Record<string, unknown>,
): Promise<void> => {
  await client.mutation({
    updatePeople: {
      __args: { filter: { id: { in: recordIds } }, data },
      id: true,
    },
  });
};
