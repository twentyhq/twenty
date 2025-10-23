import { selectorFamily } from 'recoil';

import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import {
  FieldMetadataType,
  RelationType,
  type ObjectRecord,
} from 'twenty-shared/types';
import {
  computeMorphRelationFieldName,
  CustomError,
  isDefined,
} from 'twenty-shared/utils';

export const recordStoreFieldValueSelector = selectorFamily({
  key: 'recordStoreFieldValueSelector',
  get:
    ({
      recordId,
      fieldName,
      fieldDefinition,
    }: {
      recordId: string;
      fieldName: string;
      fieldDefinition: Pick<
        FieldDefinition<FieldMetadata>,
        'type' | 'metadata'
      >;
    }) =>
    ({ get }) => {
      if (fieldDefinition.type !== FieldMetadataType.MORPH_RELATION) {
        return get(recordStoreFamilyState(recordId))?.[fieldName];
      }

      if (!isFieldMorphRelation(fieldDefinition)) {
        throw new CustomError(
          'Field definition is not a morph relation',
          'FIELD_DEFINITION_NOT_A_MORPH_RELATION',
        );
      }

      const morphRelations = fieldDefinition.metadata.morphRelations;

      if (!Array.isArray(morphRelations) || morphRelations.length === 0) {
        throw new CustomError(
          'No morph relations found',
          'NO_MORPH_RELATIONS_FOUND',
        );
      }

      const morphValuesWithObjectName = morphRelations.map((morphRelation) => {
        const computedFieldName = computeMorphRelationFieldName({
          fieldName: morphRelation.sourceFieldMetadata.name,
          relationType: morphRelation.type,
          targetObjectMetadataNameSingular:
            morphRelation.targetObjectMetadata.nameSingular,
          targetObjectMetadataNamePlural:
            morphRelation.targetObjectMetadata.namePlural,
        });
        return {
          objectNameSingular: morphRelation.targetObjectMetadata.nameSingular,
          value: get(recordStoreFamilyState(recordId))?.[computedFieldName],
        };
      });

      const relationType = morphRelations[0].type;

      if (relationType === RelationType.ONE_TO_MANY) {
        return morphValuesWithObjectName as {
          objectNameSingular: string;
          value: ObjectRecord[];
        }[];
      }

      if (relationType === RelationType.MANY_TO_ONE) {
        const morphValueFiltered = morphValuesWithObjectName.filter(
          (morphValue) => isDefined(morphValue.value),
        );
        return morphValueFiltered.length > 0
          ? (morphValueFiltered[0] as {
              objectNameSingular: string;
              value: ObjectRecord;
            })
          : null;
      }

      throw new CustomError(
        `Unknown relation type: ${relationType}`,
        'UNKNOWN_RELATION_TYPE',
      );
    },
});
