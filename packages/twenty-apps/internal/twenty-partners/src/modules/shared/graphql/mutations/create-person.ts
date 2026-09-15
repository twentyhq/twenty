import type { CoreApiClient } from 'twenty-client-sdk/core';

export type CreatePersonInput = {
  firstName: string;
  lastName: string;
  email: string;
  companyId: string;
};

export function createPerson(client: CoreApiClient, input: CreatePersonInput) {
  return client.mutation({
    createPerson: {
      __args: {
        data: {
          name: { firstName: input.firstName, lastName: input.lastName },
          emails: { primaryEmail: input.email },
          companyId: input.companyId,
        },
      },
      id: true,
    },
  });
}
