import type { CoreApiClient } from 'twenty-client-sdk/core';

import { createCompany } from 'src/modules/shared/graphql/mutations/create-company';
import { createPerson } from 'src/modules/shared/graphql/mutations/create-person';
import { findCompanyByName } from 'src/modules/shared/graphql/queries/find-company-by-name';
import { findPersonByEmail } from 'src/modules/shared/graphql/queries/find-person-by-email';

export async function findCompanyIdByExactName(
  client: CoreApiClient,
  companyName: string,
): Promise<string | undefined> {
  const name = companyName.trim();

  const lookup = await findCompanyByName(client, name);

  return lookup.companies?.edges?.[0]?.node?.id;
}

export async function findOrCreateCompanyByName(
  client: CoreApiClient,
  companyName: string,
): Promise<string> {
  const existing = await findCompanyIdByExactName(client, companyName);
  if (existing !== undefined) return existing;

  const name = companyName.trim();
  const result = await createCompany(client, name);
  const id = result.createCompany?.id;
  if (id === undefined) throw new Error('createCompany did not return an id');
  return id;
}

export async function findPersonIdByPrimaryEmail(
  client: CoreApiClient,
  email: string,
): Promise<string | undefined> {
  const primaryEmail = email.trim();

  const lookup = await findPersonByEmail(client, primaryEmail);

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

  const result = await createPerson(client, { email, firstName, lastName, companyId: input.companyId });
  const id = result.createPerson?.id;
  if (id === undefined) throw new Error('createPerson did not return an id');
  return id;
}
