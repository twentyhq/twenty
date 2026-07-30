import { useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { RELATION_FIELD_REFETCH_DEBOUNCE_MS } from '@/object-record/record-field/ui/constants/RelationFieldRefetchDebounceMs';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { RelationType } from '~/generated-metadata/graphql';

type UseRefetchRelationFieldOnRecordChangeParams = {
  recordId: string;
  objectMetadataId: string;
  fieldMetadataItem: FieldMetadataItem | undefined;
};

export const useRefetchRelationFieldOnRecordChange = ({
  recordId,
  objectMetadataId,
  fieldMetadataItem,
}: UseRefetchRelationFieldOnRecordChangeParams) => {
  const isToManyRelation =
    fieldMetadataItem?.relation?.type === RelationType.ONE_TO_MANY;

  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const { findOneRecord } = useLazyFindOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
    fetchPolicy: 'network-only',
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const refetchRecord = useCallback(async () => {
    await findOneRecord({
      objectRecordId: recordId,
      onCompleted: (record) => {
        upsertRecordsInStore({ partialRecords: [record] });
      },
    });
  }, [findOneRecord, recordId, upsertRecordsInStore]);

  const debouncedRefetchRecord = useDebouncedCallback(
    refetchRecord,
    RELATION_FIELD_REFETCH_DEBOUNCE_MS,
  );

  const handleRecordOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      if (!isToManyRelation) {
        return;
      }

      if (
        operation.type !== 'update-one' &&
        operation.type !== 'update-many'
      ) {
        return;
      }

      const updatedRecordIds =
        operation.type === 'update-one'
          ? [operation.result.updateInput.recordId]
          : operation.result.updateInputs.map(
              (updateInput) => updateInput.recordId,
            );

      if (!updatedRecordIds.includes(recordId)) {
        return;
      }

      debouncedRefetchRecord();
    },
    [debouncedRefetchRecord, isToManyRelation, recordId],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleRecordOperation,
    objectMetadataItemId: objectMetadataId,
    operationTypes: ['update-one', 'update-many'],
  });
};
