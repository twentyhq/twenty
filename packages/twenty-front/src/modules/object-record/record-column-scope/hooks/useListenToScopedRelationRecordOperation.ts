import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { isScopedRelationRecordOperationRelevant } from '@/object-record/record-column-scope/utils/isScopedRelationRecordOperationRelevant';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useStore } from 'jotai';
import { useContext } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// Scoped values come from the table query, so a related record written elsewhere only shows after a refetch
export const useListenToScopedRelationRecordOperation = ({
  onScopedRelationRecordOperation,
}: {
  onScopedRelationRecordOperation: () => void;
}) => {
  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);
  const store = useStore();

  const handleRecordOperation = ({
    objectMetadataItem,
    operation,
  }: ObjectRecordOperationBrowserEventDetail) => {
    const isRelevant = isScopedRelationRecordOperationRelevant({
      operation,
      operationObjectMetadataItemId: objectMetadataItem.id,
      scopedRelationAliases,
      isRecordLoaded: (recordId) =>
        isDefined(store.get(recordStoreFamilyState.atomFamily(recordId))),
    });

    if (isRelevant) {
      onScopedRelationRecordOperation();
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    enabled: isNonEmptyArray(scopedRelationAliases),
  });
};
