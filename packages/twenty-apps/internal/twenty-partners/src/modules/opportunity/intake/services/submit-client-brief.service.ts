import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

import {
  findOrCreateCompanyByName,
  findOrCreatePersonByEmail,
} from 'src/modules/shared/services/find-or-create-company-and-person.service';
import { createOpportunity } from 'src/modules/opportunity/intake/graphql/mutations/create-opportunity';
import { findPartnerIdBySlug } from 'src/modules/opportunity/intake/graphql/queries/find-partner-id-by-slug';
import {
  buildRequirementsText,
  type SubmitClientBriefInput,
} from 'src/modules/opportunity/intake/mappers/build-requirements-text.mapper';
import { notifyClientBrief } from 'src/modules/opportunity/intake/services/notify-client-brief.service';

export type SubmitClientBriefResult =
  | { ok: true; opportunityId: string }
  | { ok: false; reason: string };

export type ReferringPartner = { id: string; name: string };

async function resolveReferringPartner(
  client: CoreApiClient,
  slug: string | undefined,
): Promise<ReferringPartner | null> {
  if (slug === undefined) return null;
  const result = await findPartnerIdBySlug(client, slug);
  const node = result.partners?.edges?.[0]?.node;
  if (node === undefined) {
    console.warn(`submit-client-brief: no partner for slug "${slug}"`);
    return null;
  }
  return { id: node.id, name: node.name };
}

export async function submitClientBrief(
  input: SubmitClientBriefInput,
): Promise<SubmitClientBriefResult> {
  try {
    const client = new CoreApiClient();
    const name = `${input.companyName.trim()} — marketplace brief`;
    const requirements = buildRequirementsText(input);

    const companyId = await findOrCreateCompanyByName(client, input.companyName);
    const pointOfContactId = await findOrCreatePersonByEmail(client, {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      companyId,
    });
    const referringPartner = await resolveReferringPartner(client, input.partnerSlug);

    const opportunityData: CoreSchema.OpportunityCreateInput = {
      name,
      need: input.need,
      isListed: false,
      stage: 'NEW',
      companyId,
      pointOfContactId,
    };
    if (requirements !== null) {
      opportunityData.requirements = requirements;
    }
    if (referringPartner !== null) {
      opportunityData.referredByPartnerId = referringPartner.id;
    }

    const result = await createOpportunity(client, opportunityData);
    const opportunityId = result.createOpportunity?.id;
    if (opportunityId === undefined) {
      throw new Error('createOpportunity did not return an id');
    }

    await notifyClientBrief({ opportunityId, input, referringPartner });

    return { ok: true, opportunityId };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
