import type { CoreApiClient } from 'twenty-client-sdk/core';

export function findPersonByEmail(client: CoreApiClient, email: string) {
  return client.query({
    people: {
      __args: {
        filter: { emails: { primaryEmail: { eq: email } } },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          partner: { id: true, company: { id: true } },
        },
      },
    },
  });
}
