import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useAttachRelatedRecordFromRecord } from '@/object-record/hooks/useAttachRelatedRecordFromRecord';
import { useDetachRelatedRecordFromRecord } from '@/object-record/hooks/useDetachRelatedRecordFromRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { multipleRecordPickerSelectedRecordsIdsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSelectedRecordsIdsComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useUpdateRelationFromManyFieldInput = ({
  scopeId,
}: {
  scopeId: string;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  assertFieldMetadata(
    FieldMetadataType.RELATION,
    isFieldRelation,
    fieldDefinition,
  );

  if (!fieldDefinition.metadata.objectMetadataNameSingular) {
    throw new Error('ObjectMetadataNameSingular is required');
  }

  const { updateOneRecordAndDetachRelations } =
    useDetachRelatedRecordFromRecord({
      recordObjectNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      fieldNameOnRecordObject: fieldDefinition.metadata.fieldName,
    });

  const { updateOneRecordAndAttachRelations } =
    useAttachRelatedRecordFromRecord({
      recordObjectNameSingular:
        fieldDefinition.metadata.objectMetadataNameSingular,
      fieldNameOnRecordObject: fieldDefinition.metadata.fieldName,
    });

  const multipleRecordPickerSelectedRecordsIdsState =
    useRecoilComponentCallbackStateV2(
      multipleRecordPickerSelectedRecordsIdsComponentState,
      scopeId,
    );

  const updateRelation = useRecoilCallback(
    ({ snapshot, set }) =>
      async (objectRecordId: string) => {
        const previouslyCheckedRecordsIds = snapshot
          .getLoadable(multipleRecordPickerSelectedRecordsIdsState)
          .getValue();

        const isNewlySelected =
          !previouslyCheckedRecordsIds.includes(objectRecordId);

        if (isNewlySelected) {
          set(multipleRecordPickerSelectedRecordsIdsState, (prev) => [
            ...prev,
            objectRecordId,
          ]);
        } else {
          set(multipleRecordPickerSelectedRecordsIdsState, (prev) =>
            prev.filter((id) => id !== objectRecordId),
          );
        }

        if (isNewlySelected) {
          await updateOneRecordAndAttachRelations({
            recordId,
            relatedRecordId: objectRecordId,
          });
        } else {
          await updateOneRecordAndDetachRelations({
            recordId,
            relatedRecordId: objectRecordId,
          });
        }
      },
    [
      multipleRecordPickerSelectedRecordsIdsState,
      recordId,
      updateOneRecordAndAttachRelations,
      updateOneRecordAndDetachRelations,
    ],
  );

  return { updateRelation };
};
