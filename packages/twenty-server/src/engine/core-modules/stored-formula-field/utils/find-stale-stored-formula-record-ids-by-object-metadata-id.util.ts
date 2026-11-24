import { isNonEmptyString } from '@sniptt/guards';

import { type StoredFormulaRelatedRecordWatchPlan } from 'src/engine/core-modules/stored-formula-field/types/stored-formula-watch-plans.type';

type RecordSnapshot = Record<string, unknown>;

type StoredFormulaSourceRecordEvent = {
  properties: {
    before?: RecordSnapshot;
    after?: RecordSnapshot;
    updatedFields?: string[];
  };
};

export const findStaleStoredFormulaRecordIdsByObjectMetadataId = ({
  events,
  watchPlans,
  isRecordUpdate,
}: {
  events: StoredFormulaSourceRecordEvent[];
  watchPlans: StoredFormulaRelatedRecordWatchPlan[];
  isRecordUpdate: boolean;
}): Record<string, string[]> => {
  const staleRecordIdsByObjectMetadataId: Record<string, Set<string>> = {};

  for (const {
    objectMetadataId,
    joinColumnName,
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

      for (const recordId of [
        before?.[joinColumnName],
        after?.[joinColumnName],
      ]) {
        if (!isNonEmptyString(recordId)) {
          continue;
        }

        staleRecordIdsByObjectMetadataId[objectMetadataId] ??= new Set();
        staleRecordIdsByObjectMetadataId[objectMetadataId].add(recordId);
      }
    }
  }

  return Object.fromEntries(
    Object.entries(staleRecordIdsByObjectMetadataId).map(
      ([objectMetadataId, recordIds]) => [objectMetadataId, [...recordIds]],
    ),
  );
};
