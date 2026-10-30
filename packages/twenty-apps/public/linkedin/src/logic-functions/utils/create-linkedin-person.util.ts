import { CoreApiClient } from 'twenty-client-sdk/core';

export const createLinkedinPerson = async ({
  firstName,
  lastName,
  handle,
}: {
  firstName: string;
  lastName: string;
  handle: string;
}): Promise<string> => {
  const { createPerson } = await new CoreApiClient().mutation({
    createPerson: {
      __args: {
        data: {
          name: { firstName, lastName },
          linkedinLink: { primaryLinkUrl: handle },
        },
      },
      id: true,
    },
  });

  return createPerson.id;
};
