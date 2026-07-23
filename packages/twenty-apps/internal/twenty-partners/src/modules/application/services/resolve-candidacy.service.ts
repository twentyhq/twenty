import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import type {
  DatabaseEventPayload,
  ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

import { findPartnerByMember } from 'src/modules/application/graphql/queries/find-partner-by-member';
import { findDuplicateApplication } from 'src/modules/application/graphql/queries/find-duplicate-application';
import { deleteApplication } from 'src/modules/application/graphql/mutations/delete-application';
import { updateApplication } from 'src/modules/application/graphql/mutations/update-application';

type ApplicationCreatedProperties = DatabaseEventPayload<
  ObjectRecordCreateEvent<CoreSchema.Application>
>['properties'];

// A partner self-applies via the "Apply to brief as partner" workflow: a Create Record action
// makes an Application with the opportunity set and createdBy = the clicking member, but no
// partner. Resolve the partner from createdBy and complete the candidacy. Admin-created
// applications (partner already set, or the creator is not a partner) are left untouched. The
// name is set by on-application-set-name, which fires on the partnerId update below.
export async function resolveCandidacy(
  client: CoreApiClient,
  after: ApplicationCreatedProperties['after'],
): Promise<Record<string, unknown>> {
  const applicationId = after?.id;
  if (!applicationId) return {};
  if (after.partnerId) return {}; // already linked (admin path) — leave it

  const memberId = after.createdBy?.workspaceMemberId;
  if (!memberId) return {}; // no member actor (system/import) — not a self-apply

  const partnerRes = await findPartnerByMember(client, memberId);
  const partnerId = partnerRes.partners?.edges?.[0]?.node?.id;
  if (!partnerId) return {}; // creator isn't a partner (e.g. admin) — leave it

  const opportunityId = after.opportunityId;
  if (opportunityId) {
    const existingRes = await findDuplicateApplication(client, opportunityId, partnerId);
    const existingId = existingRes.applications?.edges?.find(
      (edge) => edge.node?.id && edge.node.id !== applicationId,
    )?.node?.id;
    if (existingId) {
      await deleteApplication(client, applicationId);
      return { duplicate: true, keptExisting: existingId };
    }
  }

  const now = new Date().toISOString();
  await updateApplication(client, applicationId, {
    partnerId,
    partnerUserId: memberId,
    state: 'APPLIED',
    lastActivityAt: now,
  });
  // ponytail: dedupe by (opportunity, partner) above; two near-simultaneous creates could still both pass before either stamps — acceptable.
  return { applied: true, partnerId };
}
