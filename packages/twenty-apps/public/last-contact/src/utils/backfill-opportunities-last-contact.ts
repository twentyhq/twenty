import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  buildRelatedUpdateData,
  buildPersonAggregates,
  pickPersonLastContact,
} from 'src/utils/person-last-contact-aggregation';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

export type OpportunityNode = { id: string; pointOfContactId: string | null };

export const backfillOpportunitiesLastContact = async (
  client: CoreApiClient,
  nodes: OpportunityNode[],
): Promise<void> => {
  const personIds = [
    ...new Set(
      nodes
        .map((node) => node.pointOfContactId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const aggByPersonId = await buildPersonAggregates(client, personIds);

  const upserts: RecordUpsert[] = [];

  for (const node of nodes) {
    const lastContact = node.pointOfContactId
      ? pickPersonLastContact(aggByPersonId.get(node.pointOfContactId))
      : undefined;

    if (!lastContact) {
      continue;
    }

    upserts.push({ id: node.id, ...buildRelatedUpdateData(lastContact) });
  }

  await upsertRecordsInBatches(client, 'createOpportunities', upserts);
};
