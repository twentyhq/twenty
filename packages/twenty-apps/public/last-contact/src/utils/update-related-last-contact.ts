import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  type InteractionKind,
  type PersonLastContactState,
  type RelatedLastContact,
} from 'src/utils/update-person-last-contact';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

const PAGE_SIZE = 200;

export type RelatedInteraction = {
  occurredAt: string;
  itemId: string;
  kind: InteractionKind;
};

const isNewer = (
  candidate: string,
  current: string | null | undefined,
): boolean => !current || current < candidate;

const buildData = ({
  occurredAt,
  itemId,
  kind,
}: RelatedInteraction): Record<string, string | null> => ({
  lastContactAt: occurredAt,
  lastContactItemMessageId: kind === 'email' ? itemId : null,
  lastContactItemCalendarEventId: kind === 'meeting' ? itemId : null,
});

const collectOpportunitiesByPointOfContactId = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<Map<string, RelatedLastContact[]>> => {
  const opportunitiesByPersonId = new Map<string, RelatedLastContact[]>();

  for (const ids of chunk(personIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { opportunities } = await executeWithRetry(() =>
        client.query({
          opportunities: {
            __args: {
              filter: { pointOfContactId: { in: ids } },
              first: PAGE_SIZE,
              after,
            },
            edges: {
              node: {
                id: true,
                pointOfContactId: true,
                lastContactAt: true,
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of opportunities?.edges ?? []) {
        const { id, pointOfContactId, lastContactAt } = edge.node;

        if (!id || !pointOfContactId) {
          continue;
        }

        const opportunity = { id, lastContactAt: lastContactAt ?? null };
        const existing = opportunitiesByPersonId.get(pointOfContactId);

        if (existing) {
          existing.push(opportunity);
        } else {
          opportunitiesByPersonId.set(pointOfContactId, [opportunity]);
        }
      }

      after = opportunities?.pageInfo.hasNextPage
        ? (opportunities.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return opportunitiesByPersonId;
};

const resolveOpportunitiesByPersonId = async (
  client: CoreApiClient,
  stateByPersonId: Map<string, PersonLastContactState>,
  personIds: string[],
): Promise<Map<string, RelatedLastContact[]>> => {
  const opportunitiesByPersonId = new Map<string, RelatedLastContact[]>();
  const truncatedPersonIds: string[] = [];

  for (const personId of personIds) {
    const connection = stateByPersonId.get(personId)
      ?.pointOfContactForOpportunities;
    const opportunities = (connection?.edges ?? []).map(({ node }) => node);

    if ((connection?.totalCount ?? 0) > opportunities.length) {
      truncatedPersonIds.push(personId);
    } else {
      opportunitiesByPersonId.set(personId, opportunities);
    }
  }

  if (truncatedPersonIds.length > 0) {
    const fetched = await collectOpportunitiesByPointOfContactId(
      client,
      truncatedPersonIds,
    );

    for (const personId of truncatedPersonIds) {
      opportunitiesByPersonId.set(personId, fetched.get(personId) ?? []);
    }
  }

  return opportunitiesByPersonId;
};

// Companies and opportunities surface emails and meetings from their related
// people, so their last contact mirrors the most recent contact of any person
// connected to them.
export const updateRelatedLastContactForPeople = async (
  client: CoreApiClient,
  contactByPersonId: Map<string, RelatedInteraction>,
  stateByPersonId: Map<string, PersonLastContactState>,
): Promise<void> => {
  const personIds = [...contactByPersonId.keys()];

  if (personIds.length === 0) {
    return;
  }

  const contactByCompanyId = new Map<string, RelatedInteraction>();
  const lastContactAtByCompanyId = new Map<string, string | null>();

  for (const [personId, contact] of contactByPersonId) {
    const company = stateByPersonId.get(personId)?.company;

    if (!company?.id) {
      continue;
    }

    lastContactAtByCompanyId.set(company.id, company.lastContactAt ?? null);

    const current = contactByCompanyId.get(company.id);

    if (!current || contact.occurredAt > current.occurredAt) {
      contactByCompanyId.set(company.id, contact);
    }
  }

  const companyUpserts: RecordUpsert[] = [];

  for (const [companyId, contact] of contactByCompanyId) {
    if (isNewer(contact.occurredAt, lastContactAtByCompanyId.get(companyId))) {
      companyUpserts.push({ id: companyId, ...buildData(contact) });
    }
  }

  await upsertRecordsInBatches(client, 'createCompanies', companyUpserts);

  const opportunitiesByPersonId = await resolveOpportunitiesByPersonId(
    client,
    stateByPersonId,
    personIds,
  );
  const opportunityUpserts: RecordUpsert[] = [];

  for (const [personId, opportunities] of opportunitiesByPersonId) {
    const contact = contactByPersonId.get(personId);

    if (!contact) {
      continue;
    }

    for (const { id, lastContactAt } of opportunities) {
      if (isNewer(contact.occurredAt, lastContactAt)) {
        opportunityUpserts.push({ id, ...buildData(contact) });
      }
    }
  }

  await upsertRecordsInBatches(
    client,
    'createOpportunities',
    opportunityUpserts,
  );
};
