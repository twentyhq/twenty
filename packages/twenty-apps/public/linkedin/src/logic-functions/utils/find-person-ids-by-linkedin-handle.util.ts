import { CoreApiClient } from 'twenty-client-sdk/core';

import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';
import { getLinkedinProfileSlug } from 'src/logic-functions/utils/get-linkedin-profile-slug.util';
import { type LinkedinPersonRecord } from 'src/types/linkedin-person-record.type';

const coreApiClient = new CoreApiClient({ runAs: 'application' });

const getStoredSlugForms = (slug: string): string[] => [
  ...new Set([
    slug,
    slug.normalize('NFD'),
    encodeURIComponent(slug),
    encodeURIComponent(slug.normalize('NFD')),
  ]),
];

export const findPersonIdsByLinkedinHandle = async (
  handle: string,
): Promise<string[]> => {
  const slug = getLinkedinProfileSlug(handle);

  if (slug === null) {
    return [];
  }

  const { people } = await coreApiClient.query({
    people: {
      __args: {
        filter: {
          or: getStoredSlugForms(slug).map((storedSlug) => ({
            linkedinLink: {
              primaryLinkUrl: {
                ilike: `%linkedin.com/in/${escapeSqlLikePattern(storedSlug)}%`,
              },
            },
          })),
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
