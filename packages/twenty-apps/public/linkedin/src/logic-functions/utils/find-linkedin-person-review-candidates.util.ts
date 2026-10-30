import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { type LinkedinPersonRecord } from 'src/types/linkedin-person-record.type';
import { type LinkedinPersonReviewCandidate } from 'src/types/linkedin-person-review-candidate.type';

export const findLinkedinPersonReviewCandidates = async (
  personIds: string[],
): Promise<Map<string, LinkedinPersonReviewCandidate>> => {
  if (personIds.length === 0) {
    return new Map();
  }

  const { people } = await new CoreApiClient().query({
    people: {
      __args: { filter: { id: { in: personIds } }, first: personIds.length },
      edges: {
        node: {
          id: true,
          name: { firstName: true, lastName: true },
          company: { name: true },
        },
      },
    },
  });

  return new Map(
    (people?.edges ?? []).map(({ node }: { node: LinkedinPersonRecord }) => [
      node.id,
      {
        id: node.id,
        name: [node.name?.firstName, node.name?.lastName]
          .filter(isNonEmptyString)
          .join(' '),
        companyName: node.company?.name ?? null,
      },
    ]),
  );
};
