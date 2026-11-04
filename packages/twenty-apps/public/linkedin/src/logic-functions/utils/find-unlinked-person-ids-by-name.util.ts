import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { buildPersonNameFilter } from 'src/logic-functions/utils/build-person-name-filter.util';
import { UNLINKED_PERSON_FILTER } from 'src/logic-functions/utils/unlinked-person-filter.constant';
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
            buildPersonNameFilter({ firstName, lastName }),
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
