import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  buildPersonLastContactUpdate,
  collectPersonLastContactState,
  type Interaction,
  pickLatestInteraction,
} from 'src/utils/update-person-last-contact';
import {
  type RelatedInteraction,
  updateRelatedLastContactForPeople,
} from 'src/utils/update-related-last-contact';
import {
  type RecordUpsert,
  upsertRecordsInBatches,
} from 'src/utils/upsert-records-in-batches';

export const applyPersonInteractions = async (
  client: CoreApiClient,
  interactionsByPersonId: Map<string, Interaction[]>,
): Promise<void> => {
  const personIds = [...interactionsByPersonId.keys()];

  if (personIds.length === 0) {
    return;
  }

  const stateByPersonId = await collectPersonLastContactState(
    client,
    personIds,
  );
  const updates: RecordUpsert[] = [];
  const contactByPersonId = new Map<string, RelatedInteraction>();

  for (const [personId, interactions] of interactionsByPersonId) {
    const current = stateByPersonId.get(personId);

    // A person the read did not return no longer exists, and upserting its id
    // would insert it back rather than update it.
    if (!current) {
      continue;
    }

    const update = buildPersonLastContactUpdate(
      personId,
      current,
      interactions,
    );

    if (update) {
      updates.push(update);
    }

    const latest = pickLatestInteraction(interactions);

    if (latest) {
      contactByPersonId.set(personId, {
        occurredAt: latest.occurredAt,
        itemId: latest.itemId,
        kind: latest.kind,
      });
    }
  }

  await upsertRecordsInBatches(client, 'createPeople', updates);
  await updateRelatedLastContactForPeople(client, contactByPersonId);
};
