import { type CoreApiClient } from 'twenty-client-sdk/core';

export const updatePersonLastContactAtIfNewer = async (
  client: CoreApiClient,
  personId: string,
  lastContactAt: string,
): Promise<void> => {
  await client.mutation({
    updatePeople: {
      __args: {
        data: { lastContactAt },
        filter: {
          and: [
            { id: { eq: personId } },
            {
              or: [
                { lastContactAt: { is: 'NULL' } },
                { lastContactAt: { lt: lastContactAt } },
              ],
            },
          ],
        },
      },
      id: true,
    },
  });
};
