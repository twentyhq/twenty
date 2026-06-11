import { CoreApiClient } from 'twenty-client-sdk/core';

export const updatePersonLastContactAtIfNewer = async (
  client: CoreApiClient,
  personId: string,
  lastContactAt: string,
): Promise<void> => {
  const { person } = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      id: true,
      lastContactAt: true,
    },
  });

  const currentLastContactAt = person?.lastContactAt;

  if (
    currentLastContactAt &&
    new Date(currentLastContactAt) >= new Date(lastContactAt)
  ) {
    return;
  }

  await client.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: {
          lastContactAt,
        },
      },
      id: true,
    },
  });
};
