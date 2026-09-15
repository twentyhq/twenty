import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

import {
  findCompanyIdByExactName,
  findPersonIdByPrimaryEmail,
} from 'src/modules/shared/services/find-or-create-company-and-person.service';
import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';
import { createOpportunity } from 'src/modules/opportunity/intake/graphql/mutations/create-opportunity';
import { findOpportunityByDedupeKey } from 'src/modules/opportunity/intake/graphql/queries/find-opportunity-by-dedupe-key';
import {
  type ImportOpportunityFromTftInput,
  mapToOpportunityCreateInput,
} from 'src/modules/opportunity/intake/mappers/import-opportunity-from-tft.mapper';

export type ImportOpportunityFromTftResult =
  | { ok: true; created: boolean; id: string }
  | { ok: false; reason: string };

// Find by exact name, else create. Keeps its own create path (TFT sends a domain and may omit
// the name), so the shared find-or-create helper — name-only — cannot express it.
async function findOrCreateCompanyId(
  client: CoreApiClient,
  company: ImportOpportunityFromTftInput['company'],
): Promise<string | undefined> {
  const name = isNonEmptyString(company?.name) ? company.name.trim() : undefined;
  const domain = isNonEmptyString(company?.domain) ? company.domain.trim() : undefined;
  if (name === undefined && domain === undefined) return undefined;

  if (name !== undefined) {
    const existing = await findCompanyIdByExactName(client, name);
    if (existing !== undefined) return existing;
  }

  const companyData: CoreSchema.CompanyCreateInput = { name: name ?? domain! };
  if (domain !== undefined) companyData.domainName = { primaryLinkUrl: domain };

  const result = await client.mutation({
    createCompany: { __args: { data: companyData }, id: true },
  });
  const id = result.createCompany?.id;
  if (id === undefined) throw new Error('createCompany did not return an id');
  return id;
}

// Find by primary email, else create — name-only contacts can't be deduped.
async function findOrCreatePersonId(
  client: CoreApiClient,
  pointOfContact: ImportOpportunityFromTftInput['pointOfContact'],
  companyId: string | undefined,
): Promise<string | undefined> {
  const email = isNonEmptyString(pointOfContact?.email)
    ? pointOfContact.email.trim()
    : undefined;
  const firstName = isNonEmptyString(pointOfContact?.firstName)
    ? pointOfContact.firstName.trim()
    : '';
  const lastName = isNonEmptyString(pointOfContact?.lastName)
    ? pointOfContact.lastName.trim()
    : '';
  if (email === undefined && firstName === '' && lastName === '') return undefined;

  if (email !== undefined) {
    const existing = await findPersonIdByPrimaryEmail(client, email);
    if (existing !== undefined) return existing;
  }

  const personData: CoreSchema.PersonCreateInput = { name: { firstName, lastName } };
  if (email !== undefined) personData.emails = { primaryEmail: email };
  if (companyId !== undefined) personData.companyId = companyId;

  const result = await client.mutation({
    createPerson: { __args: { data: personData }, id: true },
  });
  const id = result.createPerson?.id;
  if (id === undefined) throw new Error('createPerson did not return an id');
  return id;
}

// Manual one-way copy of one Opportunity from the TFT workspace into partners; idempotent on
// tftOpportunityId (name as a fallback for manual calls).
export async function importOpportunityFromTft(
  input: ImportOpportunityFromTftInput,
): Promise<ImportOpportunityFromTftResult> {
  try {
    const client = new CoreApiClient();
    const name = input.name.trim();
    const tftOpportunityId = isNonEmptyString(input.tftOpportunityId)
      ? input.tftOpportunityId.trim()
      : undefined;

    const dedupeFilter: CoreSchema.OpportunityFilterInput =
      tftOpportunityId !== undefined
        ? { tftOpportunityId: { eq: tftOpportunityId } }
        : { name: { eq: name } };
    const existing = await findOpportunityByDedupeKey(client, dedupeFilter);
    const existingId = existing.opportunities?.edges?.[0]?.node?.id;
    if (existingId !== undefined) return { ok: true, created: false, id: existingId };

    const companyId = await findOrCreateCompanyId(client, input.company);
    const pointOfContactId = await findOrCreatePersonId(
      client,
      input.pointOfContact,
      companyId,
    );

    const opportunityData = mapToOpportunityCreateInput(input, {
      companyId,
      pointOfContactId,
    });

    const result = await createOpportunity(client, opportunityData);
    const id = result.createOpportunity?.id;
    if (id === undefined) throw new Error('createOpportunity did not return an id');

    return { ok: true, created: true, id };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
