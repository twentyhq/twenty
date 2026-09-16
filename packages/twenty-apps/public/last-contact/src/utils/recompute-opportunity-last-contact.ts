import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';

const PAGE_SIZE = 200;

type LastContactData = Record<string, string | null>;

const EMPTY_LAST_CONTACT: LastContactData = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

type PersonLastContact = {
  lastContactAt?: string | null;
  lastContactItemMessage?: { id: string } | null;
  lastContactItemCalendarEvent?: { id: string } | null;
};

const collectPointOfContactIdByOpportunityId = async (
  client: CoreApiClient,
  opportunityIds: string[],
): Promise<Map<string, string | null>> => {
  const pointOfContactIdByOpportunityId = new Map<string, string | null>();

  for (const ids of chunk(opportunityIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { opportunities } = await executeWithRetry(() =>
        client.query({
          opportunities: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: { node: { id: true, pointOfContactId: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of opportunities?.edges ?? []) {
        const { id, pointOfContactId } = edge.node;

        if (id) {
          pointOfContactIdByOpportunityId.set(id, pointOfContactId ?? null);
        }
      }

      after = opportunities?.pageInfo.hasNextPage
        ? (opportunities.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return pointOfContactIdByOpportunityId;
};

const collectLastContactByPersonId = async (
  client: CoreApiClient,
  personIds: string[],
): Promise<Map<string, LastContactData>> => {
  const lastContactByPersonId = new Map<string, LastContactData>();

  for (const ids of chunk(personIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { people } = await executeWithRetry(() =>
        client.query({
          people: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: {
              node: {
                id: true,
                lastContactAt: true,
                lastContactItemMessage: { id: true },
                lastContactItemCalendarEvent: { id: true },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of people?.edges ?? []) {
        const person = edge.node as PersonLastContact & { id?: string | null };

        if (!person.id) {
          continue;
        }

        lastContactByPersonId.set(person.id, {
          lastContactAt: person.lastContactAt ?? null,
          lastContactItemMessageId: person.lastContactItemMessage?.id ?? null,
          lastContactItemCalendarEventId:
            person.lastContactItemCalendarEvent?.id ?? null,
        });
      }

      after = people?.pageInfo.hasNextPage
        ? (people.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  return lastContactByPersonId;
};

// An opportunity's last contact mirrors its point of contact, so it must be
// recomputed whenever the opportunity is created or its point of contact changes,
// not only when an interaction happens.
export const recomputeOpportunitiesLastContact = async (
  client: CoreApiClient,
  opportunityIds: string[],
): Promise<void> => {
  if (opportunityIds.length === 0) {
    return;
  }

  const pointOfContactIdByOpportunityId =
    await collectPointOfContactIdByOpportunityId(client, opportunityIds);
  const personIds = [
    ...new Set(
      [...pointOfContactIdByOpportunityId.values()].filter(
        (pointOfContactId): pointOfContactId is string => !!pointOfContactId,
      ),
    ),
  ];
  const lastContactByPersonId = await collectLastContactByPersonId(
    client,
    personIds,
  );

  for (const [
    opportunityId,
    pointOfContactId,
  ] of pointOfContactIdByOpportunityId) {
    const data =
      (pointOfContactId
        ? lastContactByPersonId.get(pointOfContactId)
        : undefined) ?? EMPTY_LAST_CONTACT;

    await executeWithRetry(() =>
      client.mutation({
        updateOpportunity: {
          __args: { id: opportunityId, data },
          id: true,
        },
      }),
    );
  }
};
