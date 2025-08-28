import { useRecoilCallback } from 'recoil';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldRelationToOneValue } from '@/object-record/record-field/ui/types/guards/isFieldRelationToOneValue';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { isFieldMorphRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationManyToOne';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const usePersistFieldForMorphRelationManyToOne = () => {
  const objectMetadataItems = useObjectMetadataItems();

  // remove the usepersit on the other pr since it's onl for manytoton and we will not use it
  // replace with useupdatemultiplefrom many from the othe rPR
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectMetadataItem?.nameSingular ?? '',
  });

  const persistFieldForMorphRelationManyToOne = useRecoilCallback(
    ({ set, snapshot }) =>
      ({
        recordId,
        fieldDefinition,
        valueToPersist,
      }: {
        recordId: string;
        fieldDefinition: FieldDefinition<FieldMetadata>;
        valueToPersist: unknown;
      }) => {
        const fieldIsMorphRelationManyToOneObject =
          isFieldMorphRelationManyToOne(fieldDefinition) &&
          isFieldRelationToOneValue(valueToPersist);

        const fieldName = fieldDefinition.metadata.fieldName;

        const currentValue: any = snapshot
          .getLoadable(recordStoreFamilySelector({ recordId, fieldName }))
          .getValue();

        if (
          fieldIsMorphRelationManyToOneObject &&
          valueToPersist?.id === currentValue?.id
        ) {
          return;
        }

        if (isDeeplyEqual(valueToPersist, currentValue)) {
          return;
        }

        set(recordStoreFamilySelector({ recordId, fieldName }), valueToPersist);

        if (fieldIsRelationToOneObject) {
          updateOneRecord?.({
            idToUpdate: recordId,
            updateOneRecordInput: {
              [getForeignKeyNameFromRelationFieldName(fieldName)]:
                valueToPersist?.id ?? null,
            },
          });
          return;
        }

        updateOneRecord?.({
          idToUpdate: recordId,
          updateOneRecordInput: {
            [fieldName]: valueToPersist,
          },
        });
      },
    [updateOneRecord],
  );

  return persistFieldForMorphRelationManyToOne;
};
