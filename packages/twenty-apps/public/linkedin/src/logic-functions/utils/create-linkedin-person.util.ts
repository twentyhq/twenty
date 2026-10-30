import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

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

  if (!isDefined(createPerson)) {
    throw new Error(`Could not create the person for ${handle}`);
  }

  return createPerson.id;
};
