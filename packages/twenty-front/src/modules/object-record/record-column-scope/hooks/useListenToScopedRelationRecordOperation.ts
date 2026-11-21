import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { getScopedRelationFieldNamesShowingObject } from '@/object-record/record-column-scope/utils/getScopedRelationFieldNamesShowingObject';
import { invalidateCachedScopedRelations } from '@/object-record/record-column-scope/utils/invalidateCachedScopedRelations';
import { useContext } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';

// Only the server applies a scope, so a write the client cannot place drops every cached scoped value
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
    const relationFieldNames = getScopedRelationFieldNamesShowingObject({
      scopedRelationAliases,
      objectMetadataItemId: objectMetadataItem.id,
    });

    if (!isNonEmptyArray(relationFieldNames)) {
      return;
    }

    invalidateCachedScopedRelations({
      cache: apolloCoreClient.cache,
      objectNameSingular,
      relationFieldNames,
    });

    onScopedRelationRecordOperation();
  };

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    enabled: isNonEmptyArray(scopedRelationAliases),
  });
};
