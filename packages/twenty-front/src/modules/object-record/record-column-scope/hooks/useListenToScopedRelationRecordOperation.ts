import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { invalidateCachedScopedRelations } from '@/object-record/record-column-scope/utils/invalidateCachedScopedRelations';
import { useContext } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

// Only the server applies a scope, and a write from another client or to an uncached record names no row,
// so the reload has to refetch every cached scoped value of the relation
export const useListenToScopedRelationRecordOperation = ({
  objectNameSingular,
  onScopedRelationRecordOperation,
}: {
  objectNameSingular: string;
  onScopedRelationRecordOperation: () => void;
}) => {
  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);
  const apolloCoreClient = useApolloCoreClient();

  const handleRecordOperation = ({
    objectMetadataItem,
  }: ObjectRecordOperationBrowserEventDetail) => {
    // A join object column also lists its target records, which carry no reference to the rows showing them
    const scopedRelationFieldNames = scopedRelationAliases
      .filter(
        ({ relationObjectMetadataItem, scopedRelationJunction }) =>
          relationObjectMetadataItem.id === objectMetadataItem.id ||
          scopedRelationJunction?.targetObjectMetadataItem.id ===
            objectMetadataItem.id,
      )
      .map(({ relationFieldName }) => relationFieldName);

    if (!isNonEmptyArray(scopedRelationFieldNames)) {
      return;
    }

    invalidateCachedScopedRelations({
      cache: apolloCoreClient.cache,
      objectNameSingular,
      relationFieldNames: [...new Set(scopedRelationFieldNames)],
    });

    onScopedRelationRecordOperation();
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    enabled: isNonEmptyArray(scopedRelationAliases),
  });
};
