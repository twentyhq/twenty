import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useEffect, useState } from 'react';
import { type JsonValue } from 'type-fest';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type RecordFormFieldInputsEffectProps = {
  fieldMetadataItems: FieldMetadataItem[];
  draftRecord: Partial<ObjectRecord>;
  onFieldValueChange: (gqlFieldName: string, value: JsonValue) => void;
};

export const RecordFormFieldInputsEffect = ({
  fieldMetadataItems,
  draftRecord,
  onFieldValueChange,
}: RecordFormFieldInputsEffectProps) => {
  const [hasSeededCurrencyDefaults, setHasSeededCurrencyDefaults] =
    useState(false);

  useEffect(() => {
    if (hasSeededCurrencyDefaults || !isNonEmptyArray(fieldMetadataItems)) {
      return;
    }
    setHasSeededCurrencyDefaults(true);

    for (const fieldMetadataItem of fieldMetadataItems) {
      const gqlFieldName = getFieldMetadataItemGqlFieldName(fieldMetadataItem);

      if (Object.hasOwn(draftRecord, gqlFieldName)) {
        continue;
      }

      const defaultValue =
        getRecordFormCurrencyFieldDefaultValue(fieldMetadataItem);

      if (isDefined(defaultValue)) {
        onFieldValueChange(gqlFieldName, defaultValue);
      }
    }
  }, [
    draftRecord,
    fieldMetadataItems,
    hasSeededCurrencyDefaults,
    onFieldValueChange,
  ]);

  return null;
};
