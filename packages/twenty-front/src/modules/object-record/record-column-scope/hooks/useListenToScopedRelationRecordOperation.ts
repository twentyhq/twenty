import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { getScopedRelationFieldNamesReachingObject } from '@/object-record/record-column-scope/utils/getScopedRelationFieldNamesReachingObject';
import { invalidateCachedScopedRelations } from '@/object-record/record-column-scope/utils/invalidateCachedScopedRelations';
import { useContext } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

// Only the server applies a scope, so a write the client cannot place drops the cached scoped values.
// A burst of writes scans the cache once, as a scan costs as much as the session has cached, and the reload
// that follows refetches every scoped column of the table.
export const useListenToScopedRelationRecordOperation = ({
  objectNameSingular,
  onScopedRelationRecordOperation,
  debounceTimeInMs,
}: {
  objectNameSingular: string;
  onScopedRelationRecordOperation: () => void;
  debounceTimeInMs: number;
}) => {
  const scopedRelationAliases = useContext(ScopedRelationAliasesContext);
  const apolloCoreClient = useApolloCoreClient();
  const invalidateAndReload = useDebouncedCallback(
    () => {
      invalidateCachedScopedRelations({
        cache: apolloCoreClient.cache,
        objectNameSingular,
        relationFieldNames: [
          ...new Set(
            scopedRelationAliases.map(
              ({ relationWithArguments }) =>
                relationWithArguments.relationFieldName,
            ),
          ),
        ],
      });

      onScopedRelationRecordOperation();
    },
    debounceTimeInMs,
    { leading: false },
  );

  const handleRecordOperation = ({
    objectMetadataItem,
  }: ObjectRecordOperationBrowserEventDetail) => {
    const relationFieldNames = getScopedRelationFieldNamesReachingObject({
      scopedRelationAliases,
      objectMetadataItemId: objectMetadataItem.id,
    });

    if (isNonEmptyArray(relationFieldNames)) {
      invalidateAndReload();
    }
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    enabled: isNonEmptyArray(scopedRelationAliases),
  });
};
