import { CoreApiClient } from 'twenty-client-sdk/core';

import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';
import { getLinkedinProfileSlug } from 'src/logic-functions/utils/get-linkedin-profile-slug.util';
import { type LinkedinPersonRecord } from 'src/types/linkedin-person-record.type';

// Stored links vary in scheme, www. and trailing slash, so candidates are narrowed by slug then compared exactly
export const findPersonIdsByLinkedinHandle = async (
  handle: string,
): Promise<string[]> => {
  const slug = getLinkedinProfileSlug(handle);

  if (slug === null) {
    return [];
  }

  const { people } = await new CoreApiClient().query({
    people: {
      __args: {
        filter: {
          linkedinLink: {
            primaryLinkUrl: {
              ilike: `%linkedin.com/in/${escapeSqlLikePattern(slug)}%`,
            },
          },
        },
        first: 10,
      },
      edges: { node: { id: true, linkedinLink: { primaryLinkUrl: true } } },
    },
  });

  return (people?.edges ?? [])
    .map((edge: { node: LinkedinPersonRecord }) => edge.node)
    .filter(
      (person: LinkedinPersonRecord) =>
        getLinkedinProfileSlug(person.linkedinLink?.primaryLinkUrl ?? '') ===
        slug,
    )
    .map((person: LinkedinPersonRecord) => person.id);
};
