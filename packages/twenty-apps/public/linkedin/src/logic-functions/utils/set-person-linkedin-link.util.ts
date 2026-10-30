import { CoreApiClient } from 'twenty-client-sdk/core';

const coreApiClient = new CoreApiClient({ runAs: 'application' });

export const setPersonLinkedinLink = async ({
  personId,
  handle,
}: {
  personId: string;
  handle: string;
}): Promise<void> => {
  await coreApiClient.mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: { linkedinLink: { primaryLinkUrl: handle } },
      },
      id: true,
    },
  });
};
