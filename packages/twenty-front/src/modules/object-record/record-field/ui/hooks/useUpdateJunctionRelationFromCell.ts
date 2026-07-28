import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { useCreateManyRecords } from '@/object-record/hooks/useCreateManyRecords';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import {
  type FieldRelationFromManyValue,
  type FieldRelationMetadata,
  type FieldRelationValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { findJunctionRecordByTargetId } from '@/object-record/record-field/ui/utils/junction/findJunctionRecordByTargetId';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getSourceJoinColumnName } from '@/object-record/record-field/ui/utils/junction/getSourceJoinColumnName';
import { searchRecordStoreFamilyState } from '@/object-record/record-picker/multiple-record-picker/states/searchRecordStoreComponentFamilyState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

const pendingJunctionCreationByLink = new Map<string, Promise<void>>();

const getLinkKey = (sourceRecordId: string, targetRecordId: string) =>
  `${sourceRecordId}:${targetRecordId}`;

type UseUpdateJunctionRelationFromCellArgs = {
  fieldMetadataItem: FieldMetadataItem;
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
  recordId: string;
};

export const useUpdateJunctionRelationFromCell = ({
  fieldMetadataItem,
  fieldDefinition,
  recordId,
}: UseUpdateJunctionRelationFromCellArgs) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const sourceObjectMetadata = objectMetadataItems.find(
    (item) =>
      item.nameSingular === fieldDefinition.metadata.objectMetadataNameSingular,
  );

  const junctionConfig = getJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId: fieldDefinition.metadata.relationObjectMetadataId,
    sourceObjectMetadataId: sourceObjectMetadata?.id,
    objectMetadataItems,
  });

  const junctionObjectMetadata = junctionConfig?.junctionObjectMetadata;
  const sourceFieldOnJunction = junctionConfig?.sourceField;

  // Use relation object name as fallback to prevent hook errors (hooks can't be conditional)
  const junctionObjectNameSingular =
    junctionObjectMetadata?.nameSingular ??
    fieldDefinition.metadata.relationObjectMetadataNameSingular;

  const { createManyRecords: createJunctionRecords } = useCreateManyRecords({
    objectNameSingular: junctionObjectNameSingular,
  });

  const { deleteOneRecord: deleteJunctionRecord } = useDeleteOneRecord({
    objectNameSingular: junctionObjectNameSingular,
  });

  const fieldName = fieldDefinition.metadata.fieldName;

  const store = useStore();

  const getJunctionRecordsFromStore = useCallback(() => {
    const recordFromStore = store.get(
      recordStoreFamilyState.atomFamily(recordId),
    );

    return (
      (recordFromStore?.[fieldName] as
        | FieldRelationValue<FieldRelationFromManyValue>
        | undefined) ?? []
    );
  }, [store, recordId, fieldName]);

  const setJunctionRecordsInStore = useCallback(
    (
      getUpdatedJunctionRecords: (
        junctionRecords: ObjectRecord[],
      ) => ObjectRecord[],
    ) => {
      store.set(
        recordStoreFamilyState.atomFamily(recordId),
        (currentRecord: Record<string, unknown> | null | undefined) => {
          if (!isDefined(currentRecord)) {
            return currentRecord;
          }

          const currentJunctionRecords = currentRecord[fieldName];

          return {
            ...currentRecord,
            [fieldName]: getUpdatedJunctionRecords(
              Array.isArray(currentJunctionRecords)
                ? currentJunctionRecords
                : [],
            ),
          } as ObjectRecord;
        },
      );
    },
    [store, recordId, fieldName],
  );

  const updateJunctionRelationFromCell = useCallback(
    async ({ morphItem }: { morphItem: RecordPickerPickableMorphItem }) => {
      const targetFields = junctionConfig?.targetFields;

      if (
        !isDefined(junctionObjectMetadata) ||
        !isDefined(sourceFieldOnJunction) ||
        !isDefined(targetFields) ||
        targetFields.length === 0
      ) {
        return;
      }

      if (!isDefined(sourceObjectMetadata)) {
        return;
      }

      const sourceJoinColumnName = getSourceJoinColumnName({
        sourceField: sourceFieldOnJunction,
        sourceObjectMetadata,
      });

      const junctionObjectName = junctionObjectMetadata.nameSingular;

      const targetFieldInfo = findTargetFieldInfo(
        targetFields,
        morphItem.objectMetadataId,
        objectMetadataItems,
      );

      if (!isDefined(targetFieldInfo)) {
        return;
      }

      const targetFieldName = targetFieldInfo.fieldName;
      const targetJoinColumnName = targetFieldInfo.joinColumnName;

      if (
        !isDefined(sourceJoinColumnName) ||
        !isDefined(targetJoinColumnName)
      ) {
        return;
      }

      // morphItem.isSelected represents the NEW state (what the user wants)
      if (!morphItem.isSelected) {
        await pendingJunctionCreationByLink
          .get(getLinkKey(recordId, morphItem.recordId))
          ?.catch(() => undefined);

        const junctionRecordToDelete = findJunctionRecordByTargetId({
          junctionRecords: getJunctionRecordsFromStore(),
          targetRecordId: morphItem.recordId,
          targetFieldName,
        });

        if (!isDefined(junctionRecordToDelete)) {
          return;
        }

        await deleteJunctionRecord(junctionRecordToDelete.id);

        setJunctionRecordsInStore((junctionRecords) =>
          junctionRecords.filter(
            (junctionRecord) => junctionRecord.id !== junctionRecordToDelete.id,
          ),
        );
      } else {
        const searchRecord = store.get(
          searchRecordStoreFamilyState.atomFamily(morphItem.recordId),
        );

        if (!isDefined(searchRecord?.record)) {
          return;
        }

        const targetRecord = searchRecord.record;
        const optimisticJunctionId = v4();
        const now = new Date().toISOString();

        setJunctionRecordsInStore((junctionRecords) => [
          ...junctionRecords,
          {
            id: optimisticJunctionId,
            createdAt: now,
            updatedAt: now,
            __typename: getObjectTypename(junctionObjectName),
            [sourceJoinColumnName]: recordId,
            [targetJoinColumnName]: morphItem.recordId,
            [targetFieldName]: targetRecord,
          },
        ]);

        const junctionRecordCreation = createJunctionRecords({
          recordsToCreate: [
            {
              [sourceJoinColumnName]: recordId,
              [targetJoinColumnName]: morphItem.recordId,
            },
          ],
          upsert: true,
        }).then(([persistedJunctionRecord]) => {
          if (!isDefined(persistedJunctionRecord)) {
            return;
          }

          setJunctionRecordsInStore((junctionRecords) =>
            junctionRecords.map((junctionRecord) =>
              junctionRecord.id === optimisticJunctionId
                ? { ...junctionRecord, id: persistedJunctionRecord.id }
                : junctionRecord,
            ),
          );
        });

        const linkKey = getLinkKey(recordId, morphItem.recordId);

        pendingJunctionCreationByLink.set(linkKey, junctionRecordCreation);

        try {
          await junctionRecordCreation;
        } finally {
          if (
            pendingJunctionCreationByLink.get(linkKey) ===
            junctionRecordCreation
          ) {
            pendingJunctionCreationByLink.delete(linkKey);
          }
        }
      }
    },
    [
      store,
      createJunctionRecords,
      deleteJunctionRecord,
      getJunctionRecordsFromStore,
      setJunctionRecordsInStore,
      junctionConfig,
      junctionObjectMetadata,
      objectMetadataItems,
      recordId,
      sourceFieldOnJunction,
      sourceObjectMetadata,
    ],
  );

  const isJunctionConfigValid =
    isDefined(junctionConfig) &&
    isDefined(sourceFieldOnJunction) &&
    isDefined(junctionConfig.targetFields) &&
    junctionConfig.targetFields.length > 0;

  return {
    updateJunctionRelationFromCell,
    isJunctionConfigValid,
  };
};
