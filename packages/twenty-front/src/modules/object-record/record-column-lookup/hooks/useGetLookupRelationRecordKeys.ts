import { recordFieldLookupTargetFamilySelector } from '@/object-record/record-column-lookup/states/recordFieldLookupTargetFamilySelector';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { getScopedRelationLookupRecordKeys } from '@/object-record/record-column-scope/utils/getScopedRelationLookupRecordKeys';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';
import { useCallback, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useGetLookupRelationRecordKeys = (recordTableId?: string) => {
  const store = useStore();

  const visibleRecordFieldsSelector = useAtomComponentSelectorCallbackState(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);

  return useCallback(
    () => [
      ...store
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
      ...getScopedRelationLookupRecordKeys(scopedRelationAliases),
    ],
    [store, visibleRecordFieldsSelector, scopedRelationAliases],
  );
};
