import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { resolveRecordFieldRelationTraversal } from '@/object-record/record-field/utils/relation-traversal/resolveRecordFieldRelationTraversal';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentSelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

// A column reached through a relation reads the related record from the store,
// so the related records nested in each row are stored under their own id too.
export const useUpsertRecordsWithTraversedRelationsInStore = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();

  const visibleRecordFieldsCallbackState = useAtomComponentSelectorCallbackState(
    visibleRecordFieldsComponentSelector,
  );

  const store = useStore();

  const { upsertRecordsInStore: upsertRootRecordsInStore } =
    useUpsertRecordsInStore();

  const upsertRecordsInStore = useCallback(
    ({ partialRecords }: { partialRecords: ObjectRecord[] }) => {
      upsertRootRecordsInStore({ partialRecords });

      const traversedRelationFieldNames = new Set(
        store
          .get(visibleRecordFieldsCallbackState)
          .map((recordField) =>
            resolveRecordFieldRelationTraversal({
              recordField,
              sourceObjectMetadataItem: objectMetadataItem,
              objectMetadataItems,
            }),
          )
          .filter(isDefined)
          .map(
            (relationTraversal) =>
              relationTraversal.relationFieldMetadataItem.name,
          ),
      );

      if (traversedRelationFieldNames.size === 0) {
        return;
      }

      const relatedRecords = partialRecords.flatMap((partialRecord) =>
        [...traversedRelationFieldNames]
          .map((relationFieldName) => partialRecord[relationFieldName])
          .filter(
            (relatedRecord): relatedRecord is ObjectRecord =>
              isPlainObject(relatedRecord) && isDefined(relatedRecord.id),
          ),
      );

      if (relatedRecords.length > 0) {
        upsertRootRecordsInStore({ partialRecords: relatedRecords });
      }
    },
    [
      objectMetadataItem,
      objectMetadataItems,
      store,
      upsertRootRecordsInStore,
      visibleRecordFieldsCallbackState,
    ],
  );

  return { upsertRecordsInStore };
};
