import { CoreApiClient } from 'twenty-client-sdk/core';

import { createPartner } from 'src/modules/partner/application-intake/graphql/mutations/create-partner';
import { createPerson } from 'src/modules/partner/application-intake/graphql/mutations/create-person';
import { updatePartner } from 'src/modules/partner/application-intake/graphql/mutations/update-partner';
import { updatePerson } from 'src/modules/partner/application-intake/graphql/mutations/update-person';
import { findPersonByEmail } from 'src/modules/partner/application-intake/graphql/queries/find-person-by-email';
import {
  buildPartnerCreateData,
  buildPartnerFields,
} from 'src/modules/partner/application-intake/mappers/build-partner-fields.mapper';
import { findOrCreateCompanyId } from 'src/modules/partner/application-intake/services/find-or-create-company.service';
import { type SubmitPartnerApplicationInput } from 'src/modules/partner/application-intake/services/submit-partner-application-input.schema';

export type SubmitPartnerApplicationResult =
  | { ok: true; created: boolean; partnerId: string }
  | { ok: false; reason: string };

export async function submitPartnerApplication(
  input: SubmitPartnerApplicationInput,
): Promise<SubmitPartnerApplicationResult> {
  try {
    const client = new CoreApiClient();
    const email = input.email.trim();
    const partnerFields = buildPartnerFields(input);

    const personLookup = await findPersonByEmail(client, email);
    const existingEdge = personLookup.people?.edges?.[0]?.node;

    if (existingEdge && existingEdge.partner) {
      const partnerId = existingEdge.partner.id;
      await updatePartner(client, partnerId, partnerFields);
      await updatePerson(client, existingEdge.id, {
        name: { firstName: input.firstName.trim(), lastName: input.lastName.trim() },
      });
      return { ok: true, created: false, partnerId };
    }

    const companyId = await findOrCreateCompanyId(client, input);

    const partnerResult = await createPartner(
      client,
      buildPartnerCreateData(partnerFields, input, companyId),
    );
    const partnerId = partnerResult.createPartner?.id;
    if (partnerId === undefined) {
      throw new Error('createPartner did not return an id');
    }

    if (existingEdge) {
      await updatePerson(client, existingEdge.id, {
        partnerId,
        name: { firstName: input.firstName.trim(), lastName: input.lastName.trim() },
      });
    } else {
      await createPerson(client, {
        name: { firstName: input.firstName.trim(), lastName: input.lastName.trim() },
        emails: { primaryEmail: email },
        partnerId,
        companyId,
      });
    }

    return { ok: true, created: true, partnerId };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
