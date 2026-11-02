import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { UNLINKED_PERSON_FILTER } from 'src/logic-functions/utils/unlinked-person-filter.constant';
import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';
import { type LinkedinPersonRecord } from 'src/types/linkedin-person-record.type';

export const findUnlinkedPersonIdsByName = async ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}): Promise<string[]> => {
  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    return [];
  }

  const { people } = await new CoreApiClient({ runAs: 'application' }).query({
    people: {
      __args: {
        filter: {
          and: [
            {
              name: {
                firstName: { ilike: escapeSqlLikePattern(firstName) },
                lastName: { ilike: escapeSqlLikePattern(lastName) },
              },
            },
            UNLINKED_PERSON_FILTER,
          ],
        },
        first: 2,
      },
      edges: { node: { id: true, linkedinLink: { primaryLinkUrl: true } } },
    },
  });

  return (people?.edges ?? [])
    .map((edge: { node: LinkedinPersonRecord }) => edge.node)
    .filter(
      (person: LinkedinPersonRecord) =>
        !isNonEmptyString(person.linkedinLink?.primaryLinkUrl),
    )
    .map((person: LinkedinPersonRecord) => person.id);
};
