import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getPartnerCascadeFields } from 'src/modules/partner/onboarding/graphql/queries/get-partner-cascade-fields';
import { updateApplicationPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-application-partner-user';
import { updateCompanyPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-company-partner-user';
import { updatePartnerPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-partner-partner-user';
import { updatePersonPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-person-partner-user';

export type LinkPartnerUserResult =
  | { linked: true; partnerId: string }
  | { linked: false; reason: 'already_linked_same' | 'partner_already_linked_other' };

const collectIds = (edges: ({ node?: { id?: string | null } | null } | null)[] | null | undefined): string[] =>
  (edges ?? []).map((e) => e?.node?.id).filter((id): id is string => Boolean(id));

export async function linkPartnerUser(
  client: CoreApiClient,
  input: { partnerId: string; memberId: string },
): Promise<LinkPartnerUserResult> {
  const { partnerId, memberId } = input;
  const detail = await getPartnerCascadeFields(client, partnerId);

  const existing = detail.partner?.partnerUserId;
  if (existing) {
    return existing === memberId
      ? { linked: false, reason: 'already_linked_same' }
      : { linked: false, reason: 'partner_already_linked_other' };
  }

  const personIds = collectIds(detail.partner?.persons?.edges);
  const applicationIds = collectIds(detail.applications?.edges);
  const companyId = detail.partner?.companyId;

  const results = await Promise.allSettled([
    ...personIds.map((id) => updatePersonPartnerUser(client, id, memberId)),
    ...applicationIds.map((id) => updateApplicationPartnerUser(client, id, memberId)),
    ...(companyId ? [updateCompanyPartnerUser(client, companyId, memberId)] : []),
  ]);

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    throw new Error(`link-partner-user: ${failed} cascade write(s) failed for ${partnerId} — retrying`);
  }

  // Stamp the partner LAST: it is the commit marker resolvePartnerByEmail keys on, so a
  // throw above leaves the partner unstamped and the whole cascade re-runs on retry.
  await updatePartnerPartnerUser(client, partnerId, memberId, new Date().toISOString());
  return { linked: true, partnerId };
}
