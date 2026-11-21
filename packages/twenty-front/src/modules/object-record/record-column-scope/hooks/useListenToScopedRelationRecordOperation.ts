import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { useContext } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

// Scoped values come from the table query, so a related record written elsewhere only shows after a refetch
export const useListenToScopedRelationRecordOperation = ({
  onScopedRelationRecordOperation,
}: {
  onScopedRelationRecordOperation: () => void;
}) => {
  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);

  const handleRecordOperation = ({
    objectMetadataItem,
  }: ObjectRecordOperationBrowserEventDetail) => {
    const isShownInScopedColumn = scopedRelationAliases.some(
      ({ relationObjectMetadataItem }) =>
        relationObjectMetadataItem.id === objectMetadataItem.id,
    );

    if (isShownInScopedColumn) {
      onScopedRelationRecordOperation();
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    enabled: isNonEmptyArray(scopedRelationAliases),
  });
};
