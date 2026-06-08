import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type PersonNode } from 'src/types/person-node';

export const readPerson = async (
  client: CoreApiClient,
  recordId: string,
): Promise<PersonNode | undefined> => {
  const result = (await client.query({
    people: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: { firstName: true, lastName: true },
          emails: { primaryEmail: true },
          phones: { primaryPhoneNumber: true },
          jobTitle: true,
          linkedinLink: { primaryLinkUrl: true },
          company: { id: true },
          pdlId: true,
          pdlLastEnrichedAt: true,
        },
      },
    },
  })) as { people?: { edges?: { node: PersonNode }[] } };

  return result.people?.edges?.[0]?.node;
};
