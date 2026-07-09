import { CoreApiClient } from 'twenty-client-sdk/core';

import { type SummarizeTargetKey } from 'src/front-components/utils/summarize-target';

// Filtered list queries (not the singular lookup) so a missing record returns
// empty instead of throwing; callers fall back to an id-only prompt.
export const fetchRecordLabel = async (
  targetKey: SummarizeTargetKey,
  recordId: string,
): Promise<string | null> => {
  const client = new CoreApiClient();

  if (targetKey === 'person') {
    const { people } = await client.query({
      people: {
        __args: { filter: { id: { eq: recordId } }, first: 1 },
        edges: {
          node: {
            id: true,
            name: { firstName: true, lastName: true },
          },
        },
      },
    });

    const name = people?.edges?.[0]?.node?.name;
    const fullName = [name?.firstName, name?.lastName]
      .filter((part) => typeof part === 'string' && part.length > 0)
      .join(' ');

    return fullName.length > 0 ? fullName : null;
  }

  if (targetKey === 'company') {
    const { companies } = await client.query({
      companies: {
        __args: { filter: { id: { eq: recordId } }, first: 1 },
        edges: {
          node: {
            id: true,
            name: true,
          },
        },
      },
    });

    return companies?.edges?.[0]?.node?.name ?? null;
  }

  const { opportunities } = await client.query({
    opportunities: {
      __args: { filter: { id: { eq: recordId } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
        },
      },
    },
  });

  return opportunities?.edges?.[0]?.node?.name ?? null;
};
