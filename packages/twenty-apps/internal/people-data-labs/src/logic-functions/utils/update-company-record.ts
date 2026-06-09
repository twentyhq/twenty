import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updateCompanyRecord = async (
  client: CoreApiClient,
  recordId: string,
  data: Record<string, unknown>,
): Promise<void> => {
  await client.mutation({
    updateCompany: { __args: { id: recordId, data }, id: true },
  });
};
