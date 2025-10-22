import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldMorphRelationOneToMany } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelationOneToMany';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { recordStoreMorphManyToOneValueWithObjectNameFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreMorphManyToOneValueWithObjectNameFamilySelector';
import { recordStoreMorphOneToManyValueWithObjectNameFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreMorphOneToManyValueWithObjectNameFamilySelector';
import { useRecoilCallback } from 'recoil';
import { FieldMetadataType } from 'twenty-shared/types';

export const useRecordFieldValue = <T,>(
  recordId: string,
  fieldName: string,
  fieldDefinition?: FieldDefinition<FieldMetadata>,
) => {
  const recordFieldValue = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        if (fieldDefinition?.type !== FieldMetadataType.MORPH_RELATION) {
          const value = snapshot
            .getLoadable(recordStoreFamilySelector({ recordId, fieldName }))
            .getValue();
          return value as T | undefined;
        }
        assertFieldMetadata(
          FieldMetadataType.MORPH_RELATION,
          isFieldMorphRelation,
          fieldDefinition,
        );
        const morphManyToOneValue = snapshot
          .getLoadable(
            recordStoreMorphManyToOneValueWithObjectNameFamilySelector({
              recordId,
              morphRelations: fieldDefinition.metadata.morphRelations,
            }),
          )
          .getValue();

        const morphOneToManyValue = snapshot
          .getLoadable(
            recordStoreMorphOneToManyValueWithObjectNameFamilySelector({
              recordId,
              morphRelations: fieldDefinition.metadata.morphRelations,
            }),
          )
          .getValue();

        return isFieldMorphRelationOneToMany(fieldDefinition)
          ? morphOneToManyValue
          : morphManyToOneValue;
      },
    [recordId, fieldName, fieldDefinition],
  )();

  return recordFieldValue;
};
