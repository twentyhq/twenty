import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { FIELD_EDIT_BUTTON_WIDTH } from '@/ui/field/display/constants/FieldEditButtonWidth';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';

import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';

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

  const morphValuesWithObjectNameSingular = useRecordFieldValue<
    {
      objectNameSingular: string;
      value: ObjectRecord;
    }[]
  >(recordId, fieldDefinition.metadata.fieldName, fieldDefinition);

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

  return {
    fieldDefinition,
    morphValuesWithObjectNameSingular,
    maxWidth: maxWidthForField,
    recordId,
  };
};
