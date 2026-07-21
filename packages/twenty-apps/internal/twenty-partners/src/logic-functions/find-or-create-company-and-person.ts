import type { CoreApiClient } from 'twenty-client-sdk/core';

export async function findCompanyIdByExactName(
  client: CoreApiClient,
  companyName: string,
): Promise<string | undefined> {
  const name = companyName.trim();

  const lookup = await client.query({
    companies: {
      __args: { filter: { name: { eq: name } }, first: 1 },
      edges: { node: { id: true } },
    },
  });

  return lookup.companies?.edges?.[0]?.node?.id;
}

export async function findOrCreateCompanyByName(
  client: CoreApiClient,
  companyName: string,
): Promise<string> {
  const existing = await findCompanyIdByExactName(client, companyName);
  if (existing !== undefined) return existing;

  const name = companyName.trim();
  const result = await client.mutation({
    createCompany: { __args: { data: { name } }, id: true },
  });
  const id = result.createCompany?.id;
  if (id === undefined) throw new Error('createCompany did not return an id');
  return id;
}

export async function findPersonIdByPrimaryEmail(
  client: CoreApiClient,
  email: string,
): Promise<string | undefined> {
  const primaryEmail = email.trim();

  const lookup = await client.query({
    people: {
      __args: { filter: { emails: { primaryEmail: { eq: primaryEmail } } }, first: 1 },
      edges: { node: { id: true } },
    },
  });

  return lookup.people?.edges?.[0]?.node?.id;
}

export type FindOrCreatePersonByEmailInput = {
  email: string;
  firstName: string;
  lastName: string;
  companyId: string;
};

export async function findOrCreatePersonByEmail(
  client: CoreApiClient,
  input: FindOrCreatePersonByEmailInput,
): Promise<string> {
  const email = input.email.trim();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();

  const existing = await findPersonIdByPrimaryEmail(client, email);
  if (existing !== undefined) return existing;

  const result = await client.mutation({
    createPerson: {
      __args: {
        data: {
          name: { firstName, lastName },
          emails: { primaryEmail: email },
          companyId: input.companyId,
        },
      },
      id: true,
    },
  });
  const id = result.createPerson?.id;
  if (id === undefined) throw new Error('createPerson did not return an id');
  return id;
}
