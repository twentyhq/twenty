import { type CoreApiClient } from 'twenty-client-sdk/core';

import { getCompanyPartnerUser } from 'src/modules/partner/onboarding/graphql/queries/get-company-partner-user';
import { getPartnerCascadeFields } from 'src/modules/partner/onboarding/graphql/queries/get-partner-cascade-fields';
import { getPartnerOwner } from 'src/modules/partner/onboarding/graphql/queries/get-partner-owner';
import { updateApplicationPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-application-partner-user';
import { updateCompanyPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-company-partner-user';
import { updatePartnerContentPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-partner-content-partner-user';
import { updatePartnerLinkPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-partner-link-partner-user';
import { updatePartnerPartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-partner-partner-user';
import { updatePartnerServicePartnerUser } from 'src/modules/partner/onboarding/graphql/mutations/update-partner-service-partner-user';
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

  // Only stamp persons not already linked. The other cascade collections are filtered
  // server-side (partnerUserId IS NULL); persons come nested off the partner, so filter here.
  const personIds = (detail.partner?.persons?.edges ?? [])
    .filter((e) => !e?.node?.partnerUserId)
    .map((e) => e?.node?.id)
    .filter((id): id is string => Boolean(id));
  const applicationIds = collectIds(detail.applications?.edges);
  const partnerLinkIds = collectIds(detail.partnerLinks?.edges);
  const partnerServiceIds = collectIds(detail.partnerServices?.edges);
  const partnerContentIds = collectIds(detail.partnerContents?.edges);

  // Don't clobber a company already owned by a DIFFERENT partner's member. The single
  // partnerUser column models one owner per company, so overwriting would revoke that
  // partner's access to the company and its contacts. Mirrors propagatePartnerUser's
  // companyShared guard. Leave the company alone in that case; stamp only the rest.
  const companyId = detail.partner?.companyId;
  const companyWrites: Promise<unknown>[] = [];
  if (companyId) {
    const companyOwner = (await getCompanyPartnerUser(client, companyId)).company?.partnerUserId;
    if (!companyOwner || companyOwner === memberId) {
      companyWrites.push(updateCompanyPartnerUser(client, companyId, memberId));
    }
  }

  const results = await Promise.allSettled([
    ...personIds.map((id) => updatePersonPartnerUser(client, id, memberId)),
    ...applicationIds.map((id) => updateApplicationPartnerUser(client, id, memberId)),
    ...partnerLinkIds.map((id) => updatePartnerLinkPartnerUser(client, id, memberId)),
    ...partnerServiceIds.map((id) => updatePartnerServicePartnerUser(client, id, memberId)),
    ...partnerContentIds.map((id) => updatePartnerContentPartnerUser(client, id, memberId)),
    ...companyWrites,
  ]);

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    throw new Error(`link-partner-user: ${failed} cascade write(s) failed for ${partnerId} — retrying`);
  }

  // Re-check the claim immediately before the final stamp to narrow the concurrent-onboarding
  // race (two members whose emails resolve to the same partner, created at once). This is NOT
  // atomic — the API has no conditional update — so a simultaneous claim can still interleave;
  // it only shrinks the window. Known limitation, consistent with the rest of the app.
  const claimant = (await getPartnerOwner(client, partnerId)).partner?.partnerUserId;
  if (claimant && claimant !== memberId) {
    return { linked: false, reason: 'partner_already_linked_other' };
  }

  // Stamp the partner LAST — its own partnerUserId is the already-linked guard, so if any
  // cascade write throws, the partner stays unstamped and a re-invocation redoes the cascade.
  await updatePartnerPartnerUser(client, partnerId, memberId, new Date().toISOString());
  return { linked: true, partnerId };
}
