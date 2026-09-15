import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updateCompaniesStatus = async ({
  client,
  recordIds,
  data,
}: {
  client: CoreApiClient;
  recordIds: string[];
  data: Record<string, unknown>;
}): Promise<void> => {
  await client.mutation({
    updateCompanies: {
      __args: { filter: { id: { in: recordIds } }, data },
      id: true,
    },
  });
};
