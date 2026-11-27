import { recordFieldLookupTargetFamilySelector } from '@/object-record/record-column-lookup/states/recordFieldLookupTargetFamilySelector';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useGetLookupRelationFieldNames = (recordTableId?: string) => {
  const store = useStore();

  const visibleRecordFieldsSelector = useAtomComponentSelectorCallbackState(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  return useCallback(
    () =>
      store
        .get(visibleRecordFieldsSelector)
        .map(
          ({ fieldMetadataItemId, relationTargetFieldMetadataId }) =>
            store.get(
              recordFieldLookupTargetFamilySelector.selectorFamily({
                fieldMetadataItemId,
                relationTargetFieldMetadataId,
              }),
            )?.relationFieldName,
        )
        .filter(isDefined),
    [store, visibleRecordFieldsSelector],
  );
};
