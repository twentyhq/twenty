import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';
import type {
  DatabaseEventPayload,
  ObjectRecordUpdateEvent,
} from 'twenty-sdk/define';

import { collectAll } from 'src/modules/shared/utils/paginate.util';
import { getCompanyPartnerUser } from 'src/modules/opportunity/matching/graphql/queries/get-company-partner-user';
import { getOpportunityCascadeFields } from 'src/modules/opportunity/matching/graphql/queries/get-opportunity-cascade-fields';
import { getPartnerPartnerUser } from 'src/modules/opportunity/matching/graphql/queries/get-partner-partner-user';
import { findOpportunityStillUsingCompany } from 'src/modules/opportunity/matching/graphql/queries/find-opportunity-still-using-company';
import { listPeopleByFilter } from 'src/modules/opportunity/matching/graphql/queries/list-people-by-filter';
import { updateCompanyPartnerUser } from 'src/modules/opportunity/matching/graphql/mutations/update-company-partner-user';
import { updateOpportunityPartnerUser } from 'src/modules/opportunity/matching/graphql/mutations/update-opportunity-partner-user';
import { updatePersonPartnerUser } from 'src/modules/opportunity/matching/graphql/mutations/update-person-partner-user';

type OpportunityUpdateProperties = DatabaseEventPayload<
  ObjectRecordUpdateEvent<CoreSchema.Opportunity>
>['properties'];

async function collectPeopleIds(
  client: CoreApiClient,
  filter: CoreSchema.PersonFilterInput,
): Promise<string[]> {
  const nodes = await collectAll(async (after) => {
    const page = await listPeopleByFilter(client, filter, after);
    return page.people;
  });
  return nodes.map((node) => node.id).filter((id): id is string => Boolean(id));
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
    personIds.map((id) => updatePersonPartnerUser(client, id, partnerUserId)),
  );
  return results.filter((result) => result.status === 'rejected').length;
}

// On opportunity.updated when partnerId changes, propagate partnerUser (the assigned
// Partner's workspace member) across the deal so RLS visibility tracks the assignment:
// assign stamps it onto the Opportunity + linked Company + People; unassign clears it,
// keeping the Company/People if the same Partner still has another opportunity on that
// Company. Runs under the app identity, so its writes bypass partner RLS / field locks.
export async function propagatePartnerUser(
  client: CoreApiClient,
  params: {
    opportunityId: string;
    before: OpportunityUpdateProperties['before'];
    after: OpportunityUpdateProperties['after'];
  },
): Promise<Record<string, unknown>> {
  const { opportunityId, before, after } = params;
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
      const oppResult = await getOpportunityCascadeFields(client, opportunityId);
      removedMemberId = removedMemberId ?? oppResult.opportunity?.partnerUserId ?? null;
      companyId = companyId ?? oppResult.opportunity?.companyId ?? null;
    }

    await updateOpportunityPartnerUser(client, opportunityId, null);

    if (!removedMemberId || !companyId) {
      return { cascaded: true, cleared: true };
    }

    // Keep the company (and its people) if the same Partner still has another opportunity on
    // it. Decided on partnerId, not the derived partnerUser stamp (which a prior partial
    // cascade may have left unset); fall back to the stamp only if the old partnerId is
    // unavailable. The just-cleared opportunity no longer matches either filter.
    const stillInUse = await findOpportunityStillUsingCompany(client, {
      companyId,
      removedPartnerId,
      removedMemberId,
    });
    if ((stillInUse.opportunities?.edges?.length ?? 0) > 0) {
      return { cascaded: true, cleared: true, companyKept: true };
    }

    // Clear the company (only if it belongs to this member) and every person stamped for them.
    const companyResult = await getCompanyPartnerUser(client, companyId);
    if (companyResult.company?.partnerUserId === removedMemberId) {
      await updateCompanyPartnerUser(client, companyId, null);
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
  const partnerResult = await getPartnerPartnerUser(client, partnerId);
  const partnerUserId = partnerResult.partner?.partnerUserId;
  if (!partnerUserId) return { cascaded: false, reason: 'partner_has_no_user' };

  await updateOpportunityPartnerUser(client, opportunityId, partnerUserId);

  const companyId = after?.companyId;
  if (!companyId) return { cascaded: true, partnerUserId };

  // Don't clobber a company already owned by a DIFFERENT partner member. The single
  // partnerUser column on Company/Person models one owner per company, so reassigning it
  // here would steal the company (and its contacts) from the other partner and expose their
  // data. Stamp only the opportunity in that case and leave the company/people alone.
  const companyResult = await getCompanyPartnerUser(client, companyId);
  const companyOwner = companyResult.company?.partnerUserId;
  if (companyOwner && companyOwner !== partnerUserId) {
    return { cascaded: true, partnerUserId, companyShared: true };
  }

  await updateCompanyPartnerUser(client, companyId, partnerUserId);

  const peopleIds = await collectPeopleIds(client, { companyId: { eq: companyId } });
  const failed = await setPeoplePartnerUser(client, peopleIds, partnerUserId);
  if (failed > 0) {
    throw new Error(
      `on-opportunity-partner-assigned: ${failed} person stamp(s) failed — retrying`,
    );
  }

  return { cascaded: true, partnerUserId };
}
