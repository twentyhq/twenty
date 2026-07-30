import { type CoreApiClient } from 'twenty-client-sdk/core';

import { applyUpdates } from 'src/utils/last-contact/apply-updates';
import { buildPersonAggregates } from 'src/utils/last-contact/build-person-aggregates';
import {
  buildRelatedData,
  personLastContact,
} from 'src/utils/last-contact/build-related-data';
import { collectOpportunities } from 'src/utils/last-contact/collect-opportunities';

export const recomputeOpportunities = async (
  client: CoreApiClient,
  opportunityIds: string[],
): Promise<number> => {
  const opportunities = await collectOpportunities(client, opportunityIds);

  const pointOfContactIds = [
    ...new Set(
      opportunities
        .map((opportunity) => opportunity.pointOfContactId)
        .filter((personId): personId is string => Boolean(personId)),
    ),
  ];

  const aggByPersonId = await buildPersonAggregates(client, pointOfContactIds);

  const updates = opportunities.map((opportunity) => ({
    id: opportunity.id,
    data: buildRelatedData(
      opportunity.pointOfContactId
        ? personLastContact(
            aggByPersonId.get(opportunity.pointOfContactId) ?? {},
          )
        : undefined,
    ),
  }));

  await applyUpdates(client, 'updateOpportunity', updates);

  return updates.length;
};
