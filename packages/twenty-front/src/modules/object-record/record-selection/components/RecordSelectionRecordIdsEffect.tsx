import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

type RecordSelectionRecordIdsEffectProps = {
  records: Pick<ObjectRecord, 'id'>[];
};

// Record selection reads the records where a record index keeps them, so a
// list that is not a record index keeps its records there, in display order
export const RecordSelectionRecordIdsEffect = ({
  records,
}: RecordSelectionRecordIdsEffectProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
  );
  const store = useStore();

  useEffect(() => {
    const recordIdsAtom =
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      });
    const recordIds = records.map(({ id }) => id);
    const recordIdSet = new Set(recordIds);

    // A record that leaves the list leaves the selection too, so it is not
    // selected again when it comes back
    for (const previousRecordId of store.get(recordIdsAtom)) {
      if (!recordIdSet.has(previousRecordId)) {
        store.set(
          isRecordSelectedComponentFamilyState.atomFamily({
            instanceId,
            familyKey: previousRecordId,
          }),
          false,
        );
      }
    }

    const recordSelectionRangeAtom =
      recordSelectionRangeComponentState.atomFamily({ instanceId });
    const recordSelectionRange = store.get(recordSelectionRangeAtom);

    if (
      isDefined(recordSelectionRange) &&
      !recordIdSet.has(recordSelectionRange.anchorRecordId)
    ) {
      store.set(recordSelectionRangeAtom, null);
    }

    store.set(recordIdsAtom, recordIds);
  }, [instanceId, records, store]);

  // The list owns its selection, so leaving it clears the selection rather
  // than bringing it back on return
  useEffect(
    () => () => {
      const recordIds = store.get(
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId,
          familyKey: NO_RECORD_GROUP_FAMILY_KEY,
        }),
      );

      for (const recordId of recordIds) {
        store.set(
          isRecordSelectedComponentFamilyState.atomFamily({
            instanceId,
            familyKey: recordId,
          }),
          false,
        );
      }

      store.set(
        recordSelectionRangeComponentState.atomFamily({ instanceId }),
        null,
      );
    },
    [instanceId, store],
  );

  return null;
};
