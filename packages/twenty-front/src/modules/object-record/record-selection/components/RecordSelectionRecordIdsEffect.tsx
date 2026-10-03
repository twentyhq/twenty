import { useStore } from 'jotai';
import { useEffect } from 'react';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { recordSelectionRangeComponentState } from '@/object-record/record-selection/states/recordSelectionRangeComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

type RecordSelectionRecordIdsEffectProps = {
  records: Pick<ObjectRecord, 'id'>[];
  recordGroupId?: string;
};

// Record selection reads the records where the table and board keep them, so
// a list that loads its records elsewhere keeps them there, in display order
export const RecordSelectionRecordIdsEffect = ({
  records,
  recordGroupId = NO_RECORD_GROUP_FAMILY_KEY,
}: RecordSelectionRecordIdsEffectProps) => {
  const instanceId = useAvailableComponentInstanceIdOrThrow(
    RecordSelectionComponentInstanceContext,
  );
  const store = useStore();

  useEffect(() => {
    const recordIdsAtom =
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: recordGroupId,
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

    store.set(recordIdsAtom, recordIds);
  }, [instanceId, recordGroupId, records, store]);

  // The list owns its selection, so leaving it clears the selection rather
  // than bringing it back on return
  useEffect(
    () => () => {
      const recordIdsAtom =
        recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
          instanceId,
          familyKey: recordGroupId,
        });
      const recordIds = store.get(recordIdsAtom);

      for (const recordId of recordIds) {
        store.set(
          isRecordSelectedComponentFamilyState.atomFamily({
            instanceId,
            familyKey: recordId,
          }),
          false,
        );
      }

      store.set(recordIdsAtom, []);
      store.set(
        recordSelectionRangeComponentState.atomFamily({ instanceId }),
        null,
      );
    },
    [instanceId, recordGroupId, store],
  );

  return null;
};
