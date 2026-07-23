import { type CoreApiClient } from 'twenty-client-sdk/core';

import { findPartnerByPersonEmail } from 'src/modules/partner/onboarding/graphql/queries/find-partner-by-person-email';

export async function resolvePartnerByEmail(
  client: CoreApiClient,
  email: string,
): Promise<string | null> {
  const res = await findPartnerByPersonEmail(client, email);
  const partner = res.people?.edges?.[0]?.node?.partner;
  if (partner?.id && partner.validationStage === 'VALIDATED' && !partner.partnerUserId) {
    return partner.id;
  }
  return null;
}
