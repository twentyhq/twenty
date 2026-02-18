import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FIELD_EDIT_BUTTON_WIDTH } from '@/ui/field/display/constants/FieldEditButtonWidth';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { getJoinColumnNameOrThrow } from '@/object-record/record-field/ui/utils/junction/getJoinColumnNameOrThrow';
import { useRecordFieldValueV2 } from '@/object-record/record-store/hooks/useRecordFieldValueV2';
import { isDefined } from 'twenty-shared/utils';

export const useRelationToOneFieldDisplay = () => {
  const { recordId, fieldDefinition, maxWidth } = useContext(FieldContext);

  const { chipGeneratorPerObjectPerField } = useContext(
    PreComputedChipGeneratorsContext,
  );

  if (!isDefined(chipGeneratorPerObjectPerField)) {
    throw new Error('Chip generator per object per field is not defined');
  }

  assertFieldMetadata(
    FieldMetadataType.RELATION,
    isFieldRelation,
    fieldDefinition,
  );

  const button = fieldDefinition.editButtonIcon;

  const fieldName = fieldDefinition.metadata.fieldName;

  const fieldValue = useRecordFieldValueV2<ObjectRecord | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  const joinColumnName = getJoinColumnNameOrThrow(
    fieldDefinition.metadata.settings,
  );

  const foreignKeyFieldValue = useRecordFieldValueV2<string | null | undefined>(
    recordId,
    joinColumnName,
    { type: FieldMetadataType.UUID, metadata: { fieldName: joinColumnName } },
  );

  const maxWidthForField =
    isDefined(button) && isDefined(maxWidth)
      ? maxWidth - FIELD_EDIT_BUTTON_WIDTH
      : maxWidth;

  if (
    !isDefined(fieldDefinition.metadata.objectMetadataNameSingular) ||
    !isNonEmptyString(fieldDefinition.metadata.objectMetadataNameSingular)
  ) {
    throw new Error('Object metadata name singular is empty');
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
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
        });

  return {
    fieldDefinition,
    fieldValue,
    foreignKeyFieldValue,
    maxWidth: maxWidthForField,
    recordId,
    generateRecordChipData,
  };
};
