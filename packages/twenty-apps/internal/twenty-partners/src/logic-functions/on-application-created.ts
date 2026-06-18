import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordCreateEvent,
} from 'twenty-sdk/define';

const ON_APPLICATION_CREATED_FN_ID = '0e055a1c-b8b3-4572-89f3-e76e37bc3f9e';

// A partner self-applies via the "Apply to brief as partner" workflow: a Create Record action
// makes an Application with the opportunity set and createdBy = the clicking member, but no
// partner. Resolve the partner from createdBy and complete the candidacy. Admin-created
// applications (partner already set, or the creator is not a partner) are left untouched. The
// name is set by on-application-set-name, which fires on the partnerId update below.
export const handler = async (
  payload: DatabaseEventPayload<ObjectRecordCreateEvent<CoreSchema.Application>>,
): Promise<Record<string, unknown>> => {
  const after = payload.properties.after;
  const applicationId = after?.id;
  if (!applicationId) return {};
  if (after.partnerId) return {}; // already linked (admin path) — leave it

  const memberId = after.createdBy?.workspaceMemberId;
  if (!memberId) return {}; // no member actor (system/import) — not a self-apply

  const client = new CoreApiClient();
  const partnerRes = await client.query({
    partners: {
      __args: { filter: { partnerUserId: { eq: memberId } }, first: 1 },
      edges: { node: { id: true } },
    },
  });
  const partnerId = partnerRes.partners?.edges?.[0]?.node?.id;
  if (!partnerId) return {}; // creator isn't a partner (e.g. admin) — leave it

  const now = new Date().toISOString();
  await client.mutation({
    updateApplication: {
      __args: {
        id: applicationId,
        data: {
          partnerId,
          partnerUserId: memberId,
          state: 'APPLIED',
          lastActivityAt: now,
        },
      },
      id: true,
    },
  });
  // ponytail: double-clicking Apply creates duplicate applications; add idempotency if it bites.
  return { applied: true, partnerId };
};

export default defineLogicFunction({
  universalIdentifier: ON_APPLICATION_CREATED_FN_ID,
  name: 'on-application-created',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'application.created' },
});
