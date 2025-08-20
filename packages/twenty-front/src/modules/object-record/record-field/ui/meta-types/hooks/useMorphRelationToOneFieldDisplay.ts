import { isArray, isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';

import { FIELD_EDIT_BUTTON_WIDTH } from '@/ui/field/display/constants/FieldEditButtonWidth';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';

import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { useRecordFieldValues } from '@/object-record/record-store/contexts/RecordFieldValuesSelectorContext';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export const useMorphRelationToOneFieldDisplay = () => {
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

  const fieldName = fieldDefinition.metadata.fieldName;

  const computedFieldNames = fieldDefinition.metadata.morphRelations.map(
    (morphRelation) =>
      computeMorphRelationFieldName({
        fieldName,
        relationDirection: RelationType.MANY_TO_ONE,
        nameSingular: morphRelation.targetObjectMetadata.nameSingular,
        namePlural: morphRelation.targetObjectMetadata.namePlural,
      }),
  );

  const fieldValues = useRecordFieldValues<
    {
      values: ObjectRecord[];
      fieldName: string;
    }[]
  >(recordId, computedFieldNames)?.filter((fieldValue) =>
    isDefined(fieldValue.values),
  );

  if (!isDefined(fieldValues)) {
    return {
      fieldDefinition,
      fieldValues: [],
      maxWidth: maxWidth,
      recordId,
      generateRecordChipData: () => ({
        recordId: '',
        objectNameSingular: '',
      }),
    };
  }

  const fieldValuesFlattened = fieldValues?.flatMap((fieldValue) => {
    if (isArray(fieldValue.values)) {
      return fieldValue.values.map((value) => ({
        fieldName: fieldValue.fieldName,
        value,
      }));
    }
    return {
      fieldName: fieldValue.fieldName,
      value: fieldValue.values,
    };
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
  const generateRecordChipData = isDefined(fieldChipGenerator)
    ? fieldChipGenerator
    : (record: ObjectRecord) =>
        generateDefaultRecordChipData({
          record,
          objectNameSingular:
            fieldDefinition.metadata.morphRelations[0].targetObjectMetadata
              .nameSingular,
        });

  return {
    fieldDefinition,
    fieldValues: fieldValuesFlattened,
    maxWidth: maxWidthForField,
    recordId,
    generateRecordChipData,
  };
};
