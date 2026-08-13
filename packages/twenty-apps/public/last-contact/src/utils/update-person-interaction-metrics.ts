import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';
import {
  buildPersonAggregates,
  buildPersonUpdateData,
} from 'src/utils/person-last-contact-aggregation';

export const updatePersonInteractionMetrics = async (
  client: CoreApiClient,
  personId: string,
): Promise<void> => {
  const aggregates = await buildPersonAggregates(client, [personId]);
  const data = buildPersonUpdateData(aggregates.get(personId));

  await executeWithRetry(() =>
    client.mutation({
      updatePerson: {
        __args: {
          id: personId,
          data: {
            interactionCount: data.interactionCount,
            strongestConnectionId: data.strongestConnectionId,
          },
        },
        id: true,
      },
    }),
  );
};
