import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  defineLogicFunction,
  type ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

// Defined here (not in universal-identifiers.ts) to avoid touching that file's local-only id.
const ON_OPP_PARTNER_ASSIGNED_FN_UNIVERSAL_IDENTIFIER = 'd7e4a4e6-9142-4597-adcf-6fb83c0f042d';

const PEOPLE_PAGE_SIZE = 200;

// Every Person id matching the filter, paginated fully — a company can have more than one
// page of contacts and a single capped page would leave RLS stamps stale on the rest.
async function collectPeopleIds(
  client: CoreApiClient,
  filter: CoreSchema.PersonFilterInput,
): Promise<string[]> {
  const ids: string[] = [];
  let after: string | undefined;

  for (;;) {
    const page = await client.query({
      people: {
        __args: { filter, first: PEOPLE_PAGE_SIZE, ...(after ? { after } : {}) },
        edges: { node: { id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });
    for (const edge of page.people?.edges ?? []) {
      if (edge?.node?.id) ids.push(edge.node.id);
    }
    if (!page.people?.pageInfo?.hasNextPage) break;
    after = page.people.pageInfo.endCursor ?? undefined;
  }

  return ids;
}

// Set (or clear, with null) partnerUser on each Person, attempting all of them even if some
// fail. Returns the failure count so the caller can force a retry rather than silently
// leaving a partial stamp.
async function setPeoplePartnerUser(
  client: CoreApiClient,
  personIds: string[],
  partnerUserId: string | null,
): Promise<number> {
  const results = await Promise.allSettled(
    personIds.map((id) =>
      client.mutation({
        updatePerson: { __args: { id, data: { partnerUserId } }, id: true },
      }),
    ),
  );
  return results.filter((result) => result.status === 'rejected').length;
}

// On opportunity.updated when partnerId changes, propagate partnerUser (the assigned
// Partner's workspace member) across the deal so RLS visibility tracks the assignment:
// assign stamps it onto the Opportunity + linked Company + People; unassign clears it,
// keeping the Company/People if the same Partner still has another opportunity on that
// Company. Runs under the app identity, so its writes bypass partner RLS / field locks.
const handler = async (
  payload: DatabaseEventPayload<ObjectRecordUpdateEvent<CoreSchema.Opportunity>>,
): Promise<Record<string, unknown>> => {
  const { after, before, updatedFields } = payload.properties;

  if (!updatedFields?.includes('partnerId')) return {};
  const opportunityId = after?.id;
  if (!opportunityId) return {};

  const client = new CoreApiClient();
  const partnerId = after?.partnerId;

  // ── Unassign: the partner was removed from the opportunity ───────────────────
  if (!partnerId) {
    // Resolve who/what to revoke from the event's before-image so a retry (after a partial
    // failure below) still has these values even though the opportunity's own partnerUser is
    // cleared first. The removed partnerId is the source of truth for "is the company still
    // in use". Fall back to reading the not-yet-cleared opportunity if before is incomplete.
    let removedMemberId = before?.partnerUserId ?? null;
    let companyId = before?.companyId ?? null;
    const removedPartnerId = before?.partnerId;

    if (!removedMemberId || !companyId) {
      const oppResult = await client.query({
        opportunity: {
          __args: { filter: { id: { eq: opportunityId } } },
          id: true,
          partnerUserId: true,
          companyId: true,
        },
      });
      removedMemberId = removedMemberId ?? oppResult.opportunity?.partnerUserId ?? null;
      companyId = companyId ?? oppResult.opportunity?.companyId ?? null;
    }

    await client.mutation({
      updateOpportunity: {
        __args: { id: opportunityId, data: { partnerUserId: null } },
        id: true,
      },
    });

    if (!removedMemberId || !companyId) {
      return { cascaded: true, cleared: true };
    }

    // Keep the company (and its people) if the same Partner still has another opportunity on
    // it. Decided on partnerId, not the derived partnerUser stamp (which a prior partial
    // cascade may have left unset); fall back to the stamp only if the old partnerId is
    // unavailable. The just-cleared opportunity no longer matches either filter.
    const stillInUse = await client.query({
      opportunities: {
        __args: {
          filter: {
            companyId: { eq: companyId },
            ...(removedPartnerId
              ? { partnerId: { eq: removedPartnerId } }
              : { partnerUserId: { eq: removedMemberId } }),
          },
          first: 1,
        },
        edges: { node: { id: true } },
      },
    });
    if ((stillInUse.opportunities?.edges?.length ?? 0) > 0) {
      return { cascaded: true, cleared: true, companyKept: true };
    }

    // Clear the company (only if it belongs to this member) and every person stamped for them.
    const companyResult = await client.query({
      company: {
        __args: { filter: { id: { eq: companyId } } },
        id: true,
        partnerUserId: true,
      },
    });
    if (companyResult.company?.partnerUserId === removedMemberId) {
      await client.mutation({
        updateCompany: {
          __args: { id: companyId, data: { partnerUserId: null } },
          id: true,
        },
      });
    }

    const peopleIds = await collectPeopleIds(client, {
      companyId: { eq: companyId },
      partnerUserId: { eq: removedMemberId },
    });
    const failed = await setPeoplePartnerUser(client, peopleIds, null);
    if (failed > 0) {
      throw new Error(
        `on-opportunity-partner-assigned: ${failed} person clear(s) failed — retrying`,
      );
    }
    return { cascaded: true, cleared: true, companyCleared: true };
  }

  // ── Assign / reassign ────────────────────────────────────────────────────────
  const partnerResult = await client.query({
    partner: { __args: { filter: { id: { eq: partnerId } } }, id: true, partnerUserId: true },
  });
  const partnerUserId = partnerResult.partner?.partnerUserId;
  if (!partnerUserId) return { cascaded: false, reason: 'partner_has_no_user' };

  await client.mutation({
    updateOpportunity: { __args: { id: opportunityId, data: { partnerUserId } }, id: true },
  });

  const companyId = after?.companyId;
  if (!companyId) return { cascaded: true, partnerUserId };

  // Don't clobber a company already owned by a DIFFERENT partner member. The single
  // partnerUser column on Company/Person models one owner per company, so reassigning it
  // here would steal the company (and its contacts) from the other partner and expose their
  // data. Stamp only the opportunity in that case and leave the company/people alone.
  const companyResult = await client.query({
    company: {
      __args: { filter: { id: { eq: companyId } } },
      id: true,
      partnerUserId: true,
    },
  });
  const companyOwner = companyResult.company?.partnerUserId;
  if (companyOwner && companyOwner !== partnerUserId) {
    return { cascaded: true, partnerUserId, companyShared: true };
  }

  await client.mutation({
    updateCompany: { __args: { id: companyId, data: { partnerUserId } }, id: true },
  });

  const peopleIds = await collectPeopleIds(client, { companyId: { eq: companyId } });
  const failed = await setPeoplePartnerUser(client, peopleIds, partnerUserId);
  if (failed > 0) {
    throw new Error(
      `on-opportunity-partner-assigned: ${failed} person stamp(s) failed — retrying`,
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
