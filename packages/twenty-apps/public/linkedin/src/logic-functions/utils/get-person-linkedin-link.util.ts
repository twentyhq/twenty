import { CoreApiClient } from 'twenty-client-sdk/core';

import { type LinkedinPersonRecord } from 'src/types/linkedin-person-record.type';

export const getPersonLinkedinLink = async (
  personId: string,
): Promise<string | null> => {
  const { people } = await new CoreApiClient({ runAs: 'application' }).query({
    people: {
      __args: { filter: { id: { eq: personId } }, first: 1 },
      edges: { node: { id: true, linkedinLink: { primaryLinkUrl: true } } },
    },
  });

  const person: LinkedinPersonRecord | undefined = people?.edges?.[0]?.node;

  return person?.linkedinLink?.primaryLinkUrl ?? null;
};
