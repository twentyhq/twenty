import { CoreApiClient } from 'twenty-client-sdk/core';

export const setPersonLinkedinLink = async ({
  personId,
  handle,
}: {
  personId: string;
  handle: string;
}): Promise<void> => {
  await new CoreApiClient().mutation({
    updatePerson: {
      __args: {
        id: personId,
        data: { linkedinLink: { primaryLinkUrl: handle } },
      },
      id: true,
    },
  });
};
