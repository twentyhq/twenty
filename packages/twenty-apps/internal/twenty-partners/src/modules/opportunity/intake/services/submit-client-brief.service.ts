import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';

import {
  findOrCreateCompanyByName,
  findOrCreatePersonByEmail,
} from 'src/modules/shared/services/find-or-create-company-and-person.service';
import { createOpportunity } from 'src/modules/opportunity/intake/graphql/mutations/create-opportunity';
import {
  buildRequirementsText,
  type SubmitClientBriefInput,
} from 'src/modules/opportunity/intake/mappers/build-requirements-text.mapper';

export type SubmitClientBriefResult =
  | { ok: true; opportunityId: string }
  | { ok: false; reason: string };

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

    const result = await createOpportunity(client, opportunityData);
    const opportunityId = result.createOpportunity?.id;
    if (opportunityId === undefined) {
      throw new Error('createOpportunity did not return an id');
    }

    return { ok: true, opportunityId };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
