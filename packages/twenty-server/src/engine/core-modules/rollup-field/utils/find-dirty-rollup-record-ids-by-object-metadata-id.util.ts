import { isNonEmptyString } from '@sniptt/guards';

import { type RollupFieldWatchPlan } from 'src/engine/core-modules/rollup-field/types/rollup-field-watch-plan.type';

type RecordSnapshot = Record<string, unknown>;

type RollupSourceRecordEvent = {
  properties: {
    before?: RecordSnapshot;
    after?: RecordSnapshot;
    updatedFields?: string[];
  };
};

export const findDirtyRollupRecordIdsByObjectMetadataId = ({
  events,
  watchPlans,
  isRecordUpdate,
}: {
  events: RollupSourceRecordEvent[];
  watchPlans: RollupFieldWatchPlan[];
  isRecordUpdate: boolean;
}): Record<string, string[]> => {
  const dirtyRecordIdsByObjectMetadataId: Record<string, Set<string>> = {};

  for (const {
    parentObjectMetadataId,
    childJoinColumnName,
    watchedFieldNames,
  } of watchPlans) {
    const watchedFieldNameSet = new Set(watchedFieldNames);

    for (const { properties } of events) {
      const { before, after, updatedFields } = properties;

      if (
        isRecordUpdate &&
        !(updatedFields ?? []).some((fieldName) =>
          watchedFieldNameSet.has(fieldName),
        )
      ) {
        continue;
      }

      for (const parentRecordId of [
        before?.[childJoinColumnName],
        after?.[childJoinColumnName],
      ]) {
        if (!isNonEmptyString(parentRecordId)) {
          continue;
        }

        dirtyRecordIdsByObjectMetadataId[parentObjectMetadataId] ??= new Set();
        dirtyRecordIdsByObjectMetadataId[parentObjectMetadataId].add(
          parentRecordId,
        );
      }
    }
  }

  return Object.fromEntries(
    Object.entries(dirtyRecordIdsByObjectMetadataId).map(
      ([objectMetadataId, recordIds]) => [objectMetadataId, [...recordIds]],
    ),
  );
};
