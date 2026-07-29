import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRefetchRelationFieldRecord } from '@/object-record/record-field/ui/hooks/useRefetchRelationFieldRecord';
import { RELATION_FIELD_REFETCH_DEBOUNCE_MS } from '@/object-record/record-field/ui/constants/RelationFieldRefetchDebounceMs';
import { RelationType } from '~/generated-metadata/graphql';

type UseSubscribeToRelationFieldRecordChangesParams = {
  recordId: string;
  objectMetadataId: string;
  fieldMetadataItem: FieldMetadataItem | undefined;
};

// Subscribing to the related records themselves would stream one event per
// child, which a bulk write turns into thousands of cache updates. The record
// this field belongs to already emits its own events, so refetching it once per
// change keeps the list fresh at a fixed cost.
export const useSubscribeToRelationFieldRecordChanges = ({
  recordId,
  objectMetadataId,
  fieldMetadataItem,
}: UseSubscribeToRelationFieldRecordChangesParams) => {
  const isToManyRelation =
    fieldMetadataItem?.relation?.type === RelationType.ONE_TO_MANY;

  const { refetchRelationFieldRecord } = useRefetchRelationFieldRecord({
    recordId,
    objectMetadataId,
  });

  const debouncedRefetch = useDebouncedCallback(
    refetchRelationFieldRecord,
    RELATION_FIELD_REFETCH_DEBOUNCE_MS,
  );

  const handleRecordOperation = useCallback(() => {
    if (!isToManyRelation) {
      return;
    }

    debouncedRefetch();
  }, [debouncedRefetch, isToManyRelation]);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    objectMetadataItemId: isDefined(fieldMetadataItem)
      ? objectMetadataId
      : undefined,
    operationTypes: ['update-one', 'update-many'],
  });
};
