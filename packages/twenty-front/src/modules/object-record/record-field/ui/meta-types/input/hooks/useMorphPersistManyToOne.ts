import { useStore } from 'jotai';
import { useCallback } from 'react';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { buildMorphRelationUpdateInput } from '@/object-record/record-field/ui/meta-types/input/utils/buildMorphRelationUpdateInput';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelationManyToOneValue } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOneValue';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type MorphPersistManyToOneProps = {
  objectMetadataNameSingular: string;
};

export const useMorphPersistManyToOne = ({
  objectMetadataNameSingular,
}: MorphPersistManyToOneProps) => {
  const store = useStore();
  const { objectMetadataItems } = useObjectMetadataItems();

  const { updateOneRecord } = useUpdateOneRecord();

  const persistMorphManyToOne = useCallback(
    async ({
      recordId,
      fieldDefinition,
      valueToPersist,
      targetObjectMetadataNameSingular,
    }: {
      recordId: string;
      fieldDefinition: FieldDefinition<FieldMetadata>;
      valueToPersist: string | null | undefined;
      targetObjectMetadataNameSingular?: string;
    }) => {
      assertFieldMetadata(
        FieldMetadataType.MORPH_RELATION,
        isFieldMorphRelation,
        fieldDefinition,
      );

      const fieldName = fieldDefinition.metadata.fieldName;

      const targetObjectMetadataItem = isDefined(
        targetObjectMetadataNameSingular,
      )
        ? objectMetadataItems.find(
            (objectMetadataItem) =>
              objectMetadataItem.nameSingular ===
              targetObjectMetadataNameSingular,
          )
        : undefined;

      if (
        isDefined(targetObjectMetadataNameSingular) &&
        !isDefined(targetObjectMetadataItem)
      ) {
        throw new Error('Object metadata item not found');
      }

      const currentValue = store.get(
        recordStoreFamilySelector.selectorFamily({
          recordId,
          fieldName,
        }),
      );

      if (
        isFieldRelationManyToOneValue(currentValue) &&
        isDefined(currentValue) &&
        currentValue.id === valueToPersist
      ) {
        return;
      }

      const { updateInput } = buildMorphRelationUpdateInput({
        morphRelations: fieldDefinition.metadata.morphRelations,
        fieldName,
        relationType: fieldDefinition.metadata.relationType,
        objectMetadataItems,
        targetRecordId: valueToPersist ?? undefined,
        targetObjectMetadataId: targetObjectMetadataItem?.id,
      });

      updateOneRecord({
        objectNameSingular: objectMetadataNameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: updateInput,
      });
    },
    [objectMetadataItems, objectMetadataNameSingular, store, updateOneRecord],
  );

  return { persistMorphManyToOne };
};
