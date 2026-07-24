import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

const PEOPLE_PAGE_SIZE = 200;

export function listPeopleByFilter(
  client: CoreApiClient,
  filter: CoreSchema.PersonFilterInput,
  after?: string,
) {
  return client.query({
    people: {
      __args: { filter, first: PEOPLE_PAGE_SIZE, ...(after ? { after } : {}) },
      edges: { node: { id: true } },
      pageInfo: { hasNextPage: true, endCursor: true },
    },
  });
}
