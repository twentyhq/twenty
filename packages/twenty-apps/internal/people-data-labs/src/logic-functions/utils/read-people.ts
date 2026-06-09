import { type CoreApiClient } from 'twenty-client-sdk/core';

import { type PersonNode } from 'src/types/person-node';

export const readPeople = async (
  client: CoreApiClient,
  recordIds: string[],
): Promise<PersonNode[]> => {
  if (recordIds.length === 0) {
    return [];
  }

  const result = (await client.query({
    people: {
      __args: { filter: { id: { in: recordIds } }, first: recordIds.length },
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

  return result.people?.edges?.map((edge) => edge.node) ?? [];
};
