import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import type {
  DatabaseEventPayload,
  ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { findDuplicateApplication } from 'src/modules/application/graphql/queries/find-duplicate-application';
import { deleteApplication } from 'src/modules/application/graphql/mutations/delete-application';
import { updateApplication } from 'src/modules/application/graphql/mutations/update-application';
import { findPartnerByMember } from 'src/modules/shared/graphql/queries/find-partner-by-member';
import { getPartnerOwner } from 'src/modules/shared/graphql/queries/get-partner-owner';
import { grantOpportunityVisibility } from 'src/modules/shared/services/grant-opportunity-visibility.service';

type ApplicationCreatedProperties = DatabaseEventPayload<
  ObjectRecordCreateEvent<CoreSchema.Application>
>['properties'];

// The app route POST /apply-to-brief creates the Application with partnerId and
// partnerUserId already set, so this service skips the candidacy stamp and only grants
// opportunity read access. It still serves the admin path: an invite or an import sets
// partnerId but no partnerUserId, and this service stamps the partner's user so RLS
// doesn't hide the row from its own partner. The createdBy-based self-apply branch below
// is a fallback for rows created by a member without a partner set.
export async function resolveCandidacy(
  client: CoreApiClient,
  after: ApplicationCreatedProperties['after'],
): Promise<Record<string, unknown>> {
  const applicationId = after?.id;
  if (!applicationId) return {};

  const opportunityId = after.opportunityId;

  // Admin path (invite/import): without partnerUser, RLS hides the row from its own partner.
  if (after.partnerId) {
    if (after.partnerUserId) {
      await grantOpportunityVisibility(client, opportunityId, [
        after.partnerUserId,
      ]);
      return {};
    }

    const ownerRes = await getPartnerOwner(client, after.partnerId);
    const partnerUserId = ownerRes.partners?.edges?.[0]?.node?.partnerUserId;
    if (!partnerUserId) return { skipped: true, reason: 'partner_has_no_user' };

    await updateApplication(client, applicationId, { partnerUserId });
    await grantOpportunityVisibility(client, opportunityId, [partnerUserId]);
    return { stamped: partnerUserId };
  }

  const memberId = after.createdBy?.workspaceMemberId;
  if (!memberId) return {}; // no member actor (system/import) — not a self-apply

  const partnerRes = await findPartnerByMember(client, memberId);
  const partnerId = partnerRes.partners?.edges?.[0]?.node?.id;
  if (!partnerId) return {}; // creator isn't a partner (e.g. admin) — leave it

  if (opportunityId) {
    const existingRes = await findDuplicateApplication(client, opportunityId, partnerId);
    const existingId = existingRes.applications?.edges?.find(
      (edge) => edge.node?.id && edge.node.id !== applicationId,
    )?.node?.id;
    if (existingId) {
      // No grant here on purpose: the kept row's own member holds it. A second member of
      // the same partner never sees the first member's application either (partnerUser IS me).
      await deleteApplication(client, applicationId);
      return { duplicate: true, keptExisting: existingId };
    }
  }
  // ponytail: dedupe by (opportunity, partner) above; two near-simultaneous creates could still both pass before either stamps — acceptable.

  await updateApplication(client, applicationId, {
    partnerId,
    partnerUserId: memberId,
    state: 'APPLIED',
  });
  await grantOpportunityVisibility(client, opportunityId, [memberId]);

  return { applied: true, partnerId };
}
