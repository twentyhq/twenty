import { useStore } from 'jotai';
import { useCallback } from 'react';

import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { getRecordGroupByFieldColumnName } from '@/object-record/record-group/utils/getRecordGroupByFieldColumnName';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useSetRecordIdsForColumn = (recordBoardId?: string) => {
  const store = useStore();

  const recordGroupFieldMetadata = useAtomComponentStateCallbackState(
    recordIndexGroupFieldMetadataItemComponentState,
    recordBoardId,
  );

  const recordIndexRecordIdsByGroupFamilyState =
    useAtomComponentFamilyStateCallbackState(
      recordIndexRecordIdsByGroupComponentFamilyState,
      recordBoardId,
    );

  const emptyRecordGroupByIdCallbackState =
    useAtomComponentFamilyStateCallbackState(
      emptyRecordGroupByIdComponentFamilyState,
    );

  const setRecordIdsForColumn = useCallback(
    (currentRecordGroupId: string, records: ObjectRecord[]) => {
      const recordGroup = store.get(
        recordGroupDefinitionFamilyState.atomFamily(currentRecordGroupId),
      );

      const existingRecordGroupRowIds = store.get(
        recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
      );

      const currentRecordGroupFieldMetadata = store.get(
        recordGroupFieldMetadata,
      );

      if (!isDefined(currentRecordGroupFieldMetadata)) {
        return;
      }

      const recordGroupColumnName = getRecordGroupByFieldColumnName(
        currentRecordGroupFieldMetadata,
      );

      const recordGroupRowIds = records
        .filter(
          (record) => record[recordGroupColumnName] === recordGroup?.value,
        )
        .map((record) => record.id);

      if (!isDeeplyEqual(existingRecordGroupRowIds, recordGroupRowIds)) {
        store.set(
          recordIndexRecordIdsByGroupFamilyState(currentRecordGroupId),
          recordGroupRowIds,
        );
      }

      const isEmptyRecordGroup = store.get(
        emptyRecordGroupByIdCallbackState(currentRecordGroupId),
      );

      const computedIsEmptyRecordGroup = recordGroupRowIds.length === 0;

      if (computedIsEmptyRecordGroup !== isEmptyRecordGroup) {
        store.set(
          emptyRecordGroupByIdCallbackState(currentRecordGroupId),
          computedIsEmptyRecordGroup,
        );
      }
    },
    [
      recordIndexRecordIdsByGroupFamilyState,
      recordGroupFieldMetadata,
      emptyRecordGroupByIdCallbackState,
      store,
    ],
  );

  return {
    setRecordIdsForColumn,
  };
};
