import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';

import { PreComputedChipGeneratorsContext } from '@/object-metadata/contexts/PreComputedChipGeneratorsContext';
import { generateDefaultRecordChipData } from '@/object-metadata/utils/generateDefaultRecordChipData';

import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FIELD_EDIT_BUTTON_WIDTH } from '@/ui/field/display/constants/FieldEditButtonWidth';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { getRelationAggregateRecordKey } from '@/object-record/cache/utils/getRelationAggregateRecordKey';
import { TOTAL_COUNT_GQL_FIELD_NAME } from '@/object-record/constants/TotalCountGqlFieldName';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';

export const useRelationFromManyFieldDisplay = () => {
  const { recordId, fieldDefinition, maxWidth, fieldValueKey } =
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

  const relationRecordKey = fieldValueKey ?? fieldName;

  const fieldValue = useRecordFieldValue<ObjectRecord[] | undefined>(
    recordId,
    relationRecordKey,
    fieldDefinition,
  );

  const totalCount = useRecordFieldValue<number>(
    recordId,
    getRelationAggregateRecordKey({
      relationRecordKey,
      aggregateGqlFieldName: TOTAL_COUNT_GQL_FIELD_NAME,
    }),
    fieldDefinition,
  );

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
    // Only a value fetched under its own key can carry a total count; a field could be named like the sibling key
    totalCount: isDefined(fieldValueKey) ? totalCount : undefined,
    maxWidth: maxWidthForField,
    recordId,
    generateRecordChipData,
  };
};
