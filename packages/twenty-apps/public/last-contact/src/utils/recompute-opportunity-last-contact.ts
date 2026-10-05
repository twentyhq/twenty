import { type CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/utils/chunk';
import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

const PAGE_SIZE = 200;

type LastContactData = Record<string, string | null>;

const EMPTY_LAST_CONTACT: LastContactData = {
  lastContactAt: null,
  lastContactItemMessageId: null,
  lastContactItemCalendarEventId: null,
};

type OpportunityNode = {
  id?: string | null;
  pointOfContact?: {
    lastContactAt?: string | null;
    lastContactItemMessageId?: string | null;
    lastContactItemCalendarEventId?: string | null;
  } | null;
};

const buildLastContactData = (
  pointOfContact: OpportunityNode['pointOfContact'],
): LastContactData =>
  pointOfContact
    ? {
        lastContactAt: pointOfContact.lastContactAt ?? null,
        lastContactItemMessageId: pointOfContact.lastContactItemMessageId ?? null,
        lastContactItemCalendarEventId:
          pointOfContact.lastContactItemCalendarEventId ?? null,
      }
    : EMPTY_LAST_CONTACT;

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

  const upserts: RecordUpsert[] = [];

  for (const ids of chunk(opportunityIds, PAGE_SIZE)) {
    let after: string | undefined;

    do {
      const { opportunities } = await executeWithRetry(() =>
        client.query({
          opportunities: {
            __args: { filter: { id: { in: ids } }, first: PAGE_SIZE, after },
            edges: {
              node: {
                id: true,
                pointOfContact: {
                  lastContactAt: true,
                  lastContactItemMessageId: true,
                  lastContactItemCalendarEventId: true,
                },
              },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        }),
      );

      for (const edge of opportunities?.edges ?? []) {
        const { id, pointOfContact } = edge.node as OpportunityNode;

        if (id) {
          upserts.push({ id, ...buildLastContactData(pointOfContact) });
        }
      }

      after = opportunities?.pageInfo.hasNextPage
        ? (opportunities.pageInfo.endCursor ?? undefined)
        : undefined;
    } while (after);
  }

  await upsertRecordsInBatches(client, 'createOpportunities', upserts);
};
