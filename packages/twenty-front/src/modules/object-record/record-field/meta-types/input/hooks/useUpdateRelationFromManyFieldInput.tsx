import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useAttachRelatedRecordFromRecord } from '@/object-record/hooks/useAttachRelatedRecordFromRecord';
import { useDetachRelatedRecordFromRecord } from '@/object-record/hooks/useDetachRelatedRecordFromRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/types/guards/isFieldRelation';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
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

  const pickableMorphItemsState = useRecoilComponentCallbackStateV2(
    multipleRecordPickerPickableMorphItemsComponentState,
    scopeId,
  );

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
  });

  const updateRelation = useRecoilCallback(
    ({ snapshot, set }) =>
      async (relatedRecordId: string) => {
        console.log('DEBUG: updateRelation', {
          recordId,
          relatedRecordId,
        });
        const previouslyPickableMorphItems = snapshot
          .getLoadable(pickableMorphItemsState)
          .getValue();

        const isNewlyPickable = !previouslyPickableMorphItems.find(
          ({ recordId: itemRecordId }) => itemRecordId === relatedRecordId,
        );

        if (isNewlyPickable) {
          set(pickableMorphItemsState, (prev) => [
            ...prev,
            {
              recordId: relatedRecordId,
              objectMetadataId: objectMetadataItem.id,
              isSelected: false,
              isMatchingSearchFilter: true,
            },
          ]);
        } else {
          set(pickableMorphItemsState, (prev) =>
            prev.filter(
              ({ recordId: itemRecordId }) => itemRecordId !== recordId,
            ),
          );
        }

        if (isNewlyPickable) {
          await updateOneRecordAndAttachRelations({
            recordId,
            relatedRecordId: recordId,
          });
        } else {
          await updateOneRecordAndDetachRelations({
            recordId,
            relatedRecordId,
          });
        }
      },
    [
      objectMetadataItem.id,
      pickableMorphItemsState,
      recordId,
      updateOneRecordAndAttachRelations,
      updateOneRecordAndDetachRelations,
    ],
  );

  return { updateRelation };
};
