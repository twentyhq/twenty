import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { getRecordFormFieldInputSettings } from '@/object-record/record-form/utils/getRecordFormFieldInputSettings';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { useEffect, useRef } from 'react';
import { type JsonValue } from 'type-fest';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

type RecordFormFieldInputsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
  draftRecord: Partial<ObjectRecord>;
  onFieldValueChange: (gqlFieldName: string, value: JsonValue) => void;
  onFieldValueClear: (gqlFieldName: string) => void;
};

export const RecordFormFieldInputs = ({
  objectMetadataItem,
  fieldMetadataItems,
  draftRecord,
  onFieldValueChange,
  onFieldValueClear,
}: RecordFormFieldInputsProps) => {
  const hasSeededCurrencyDefaults = useRef(false);

  // FormCurrencyFieldInput only reports its value through onChange on user
  // interaction, so seed the draft with the field defaults once on mount:
  // otherwise a pre-filled default would be displayed but never submitted.
  // After a clear the draft keeps the key with a null value, so hasOwn still
  // holds and the default is not resurrected here.
  useEffect(() => {
    if (hasSeededCurrencyDefaults.current) {
      return;
    }
    hasSeededCurrencyDefaults.current = true;

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
  }, [draftRecord, fieldMetadataItems, onFieldValueChange]);

  return (
    <StyledFieldList>
      {fieldMetadataItems.map((fieldMetadataItem) => {
        const gqlFieldName = getFieldMetadataItemGqlFieldName(fieldMetadataItem);

        return (
          <FormFieldInput
            key={fieldMetadataItem.id}
            field={formatFieldMetadataItemAsFieldDefinition({
              field: fieldMetadataItem,
              objectMetadataItem,
              showLabel: true,
            })}
            defaultValue={
              Object.hasOwn(draftRecord, gqlFieldName)
                ? draftRecord[gqlFieldName]
                : getRecordFormCurrencyFieldDefaultValue(fieldMetadataItem)
            }
            onChange={(value) => onFieldValueChange(gqlFieldName, value)}
            onClear={() => onFieldValueClear(gqlFieldName)}
            settings={getRecordFormFieldInputSettings(fieldMetadataItem.type)}
          />
        );
      })}
    </StyledFieldList>
  );
};
