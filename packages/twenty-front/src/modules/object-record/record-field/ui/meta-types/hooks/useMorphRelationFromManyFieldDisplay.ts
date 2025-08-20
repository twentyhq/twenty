import { isArray, isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FIELD_EDIT_BUTTON_WIDTH } from '@/ui/field/display/constants/FieldEditButtonWidth';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { useRecordFieldValues } from '@/object-record/record-store/contexts/RecordFieldValuesSelectorContext';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldContext } from '../../contexts/FieldContext';
import { assertFieldMetadata } from '../../types/guards/assertFieldMetadata';

export const useMorphRelationFromManyFieldDisplay = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  const { chipGeneratorPerObjectPerField } = useContext(
    PreComputedChipGeneratorsContext,
  );

  if (!isDefined(chipGeneratorPerObjectPerField)) {
    throw new Error('Chip generator per object per field is not defined');
  }

  assertFieldMetadata(
    FieldMetadataType.MORPH_RELATION,
    isFieldMorphRelation,
    fieldDefinition,
  );

  const button = fieldDefinition.editButtonIcon;

  const fieldNamesMap = fieldDefinition.metadata.morphRelations.map(
    (morphRelation) => {
      return {
        morphRelation: morphRelation,
        fieldName: computeMorphRelationFieldName({
          fieldName: fieldDefinition.metadata.fieldName,
          relationDirection: RelationType.ONE_TO_MANY,
          nameSingular: morphRelation.targetObjectMetadata.nameSingular,
          namePlural: morphRelation.targetObjectMetadata.namePlural,
        }),
      };
    },
  );
  const fieldNames = fieldNamesMap.map((field) => field.fieldName);

  const fieldValues = useRecordFieldValues<
    {
      values: ObjectRecord[];
      fieldName: string;
    }[]
  >(recordId, fieldNames)?.filter(
    (fieldValue) =>
      isDefined(fieldValue.values) &&
      isArray(fieldValue.values) &&
      fieldValue.values.length > 0,
  );

  const fieldValuesFlattened = fieldValues?.flatMap((fieldValue) => {
    return fieldValue.values.map((value) => ({
      fieldName: fieldValue.fieldName,
      value,
    }));
  });

  const maxWidthForField =
    isDefined(button) && isDefined(maxWidth)
      ? maxWidth - FIELD_EDIT_BUTTON_WIDTH
      : maxWidth;

  if (
    !isDefined(fieldDefinition.metadata.objectMetadataNameSingular) ||
    !isNonEmptyString(fieldDefinition.metadata.objectMetadataNameSingular)
  ) {
    throw new Error('Object metadata name singular is not a non-empty string');
  }

  const fieldChipGenerator =
    chipGeneratorPerObjectPerField[
      fieldDefinition.metadata.objectMetadataNameSingular
    ]?.[fieldDefinition.metadata.fieldName];

  const fieldValuesWithChipData = fieldValuesFlattened?.map((fieldValue) => {
    return {
      ...fieldValue,
      generateRecordChipData: isDefined(fieldChipGenerator)
        ? fieldChipGenerator
        : (record: ObjectRecord) =>
            generateDefaultRecordChipData({
              record,
              objectNameSingular:
                fieldNamesMap.find(
                  (field) => field.fieldName === fieldValue.fieldName,
                )?.morphRelation.targetObjectMetadata.nameSingular ?? '',
            }),
    };
  });

  return {
    fieldDefinition,
    fieldValues: fieldValuesWithChipData,
    maxWidth: maxWidthForField,
    recordId,
  };
};
