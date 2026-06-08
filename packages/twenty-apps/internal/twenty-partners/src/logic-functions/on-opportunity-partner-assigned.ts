import { DatabaseEventPayload, defineLogicFunction } from 'twenty-sdk/define';
import { CoreApiClient } from 'twenty-client-sdk/core';

// Inline universalIdentifier — defined here (not in universal-identifiers.ts) to avoid
// touching that file's local-only APPLICATION_UNIVERSAL_IDENTIFIER rewrite in the bundle.
const ON_OPP_PARTNER_ASSIGNED_FN_UNIVERSAL_IDENTIFIER = 'd7e4a4e6-9142-4597-adcf-6fb83c0f042d';

// Fires on opportunity.updated when partnerId changes to a non-null value.
// Resolves the assigned Partner's partnerUser (workspace member) and stamps it onto the
// Opportunity and its linked Company + People, so the whole deal becomes visible to the
// partner under row-level permissions.
const handler = async (payload: DatabaseEventPayload) => {
  const props = payload.properties as {
    after?: { id: string; partnerId?: string | null; companyId?: string | null };
    updatedFields?: string[];
  };

  if (!props.updatedFields?.includes('partnerId')) return {};
  const partnerId = props.after?.partnerId;
  const opportunityId = props.after?.id;
  if (!partnerId || !opportunityId) return {};

  const client = new CoreApiClient();

  const partnerResult = await client.query({
    partner: { __args: { filter: { id: { eq: partnerId } } }, id: true, partnerUserId: true },
  } as any);
  const partnerUserId = (partnerResult as any).partner?.partnerUserId as string | null | undefined;
  if (!partnerUserId) return { cascaded: false, reason: 'partner_has_no_user' };

  await client.mutation({
    updateOpportunity: { __args: { id: opportunityId, data: { partnerUserId } }, id: true },
  } as any);

  const companyId = props.after?.companyId;
  if (companyId) {
    await client.mutation({
      updateCompany: { __args: { id: companyId, data: { partnerUserId } }, id: true },
    } as any);
    const peopleResult = await client.query({
      people: {
        __args: { filter: { companyId: { eq: companyId } }, first: 200 },
        edges: { node: { id: true } },
      },
    } as any);
    // A company's contacts are bounded in practice; cap at 200 and update in parallel
    // (distinct records, safe to run concurrently) to stay within the function timeout.
    const people = ((peopleResult as any).people?.edges ?? []) as { node: { id: string } }[];
    await Promise.all(
      people.map(({ node }) =>
        client.mutation({
          updatePerson: { __args: { id: node.id, data: { partnerUserId } }, id: true },
        } as any),
      ),
    );
  }

  return { cascaded: true, partnerUserId };
};

export default defineLogicFunction({
  universalIdentifier: ON_OPP_PARTNER_ASSIGNED_FN_UNIVERSAL_IDENTIFIER,
  name: 'on-opportunity-partner-assigned',
  timeoutSeconds: 15,
  handler,
  databaseEventTriggerSettings: { eventName: 'opportunity.updated' },
});
