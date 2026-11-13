import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FIELD_EDIT_BUTTON_WIDTH } from '@/ui/field/display/constants/FieldEditButtonWidth';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { scopedRelationRecordsFamilyState } from '@/object-record/record-column-scope/states/scopedRelationRecordsFamilyState';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';

export const useRelationFromManyFieldDisplay = () => {
  const { recordId, fieldDefinition, maxWidth, scopedRelationViewFieldId } =
    useContext(FieldContext);

  const { chipGeneratorPerObjectPerField } = useContext(
    PreComputedChipGeneratorsContext,
  );

  if (!isDefined(chipGeneratorPerObjectPerField)) {
    throw new Error(
      doNotTranslate('Chip generator per object per field is not defined'),
    );
  }

  assertFieldMetadata(
    FieldMetadataType.RELATION,
    isFieldRelation,
    fieldDefinition,
  );

  const button = fieldDefinition.editButtonIcon;

  const fieldName = fieldDefinition.metadata.fieldName;

  const recordFieldValue = useRecordFieldValue<ObjectRecord[] | undefined>(
    recordId,
    fieldName,
    fieldDefinition,
  );

  const scopedRelationRecords = useAtomFamilyStateValue(
    scopedRelationRecordsFamilyState,
    { viewFieldId: scopedRelationViewFieldId ?? '', recordId },
  );

  const fieldValue = isDefined(scopedRelationViewFieldId)
    ? scopedRelationRecords
    : recordFieldValue;

  const maxWidthForField =
    isDefined(button) && isDefined(maxWidth)
      ? maxWidth - FIELD_EDIT_BUTTON_WIDTH
      : maxWidth;

  if (
    !isDefined(fieldDefinition.metadata.objectMetadataNameSingular) ||
    !isNonEmptyString(fieldDefinition.metadata.objectMetadataNameSingular)
  ) {
    throw new Error(
      doNotTranslate('Object metadata name singular is not a non-empty string'),
    );
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
    maxWidth: maxWidthForField,
    recordId,
    generateRecordChipData,
  };
};
