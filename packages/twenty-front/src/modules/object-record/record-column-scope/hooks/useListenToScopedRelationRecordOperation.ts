import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { getScopedRelationFieldNamesReachingObject } from '@/object-record/record-column-scope/utils/getScopedRelationFieldNamesReachingObject';
import { invalidateCachedScopedRelations } from '@/object-record/record-column-scope/utils/invalidateCachedScopedRelations';
import { useCallback, useContext, useEffect } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

// Sole owner of cached scoped values, which optimistic effects leave untouched since only the server applies a scope.
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

  const invalidateScopedRelations = useCallback(
    () =>
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
      }),
    [apolloCoreClient.cache, objectNameSingular, scopedRelationAliases],
  );

  const invalidateAndReload = useDebouncedCallback(
    () => {
      invalidateScopedRelations();

      onScopedRelationRecordOperation();
    },
    debounceTimeInMs,
    { leading: false },
  );

  // Writes made once the table is gone are never heard, so the next table would read stale values from the cache
  useEffect(() => {
    if (!isNonEmptyArray(scopedRelationAliases)) {
      return;
    }

    return invalidateScopedRelations;
  }, [scopedRelationAliases, invalidateScopedRelations]);

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
