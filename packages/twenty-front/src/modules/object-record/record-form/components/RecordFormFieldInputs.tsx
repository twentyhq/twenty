import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { RecordFormFieldInput } from '@/object-record/record-form/components/RecordFormFieldInput';
import { RecordFormFieldInputsEffect } from '@/object-record/record-form/components/RecordFormFieldInputsEffect';
import { getRecordFormBooleanFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormBooleanFieldDefaultValue';
import { getRecordFormCurrencyFieldDefaultValue } from '@/object-record/record-form/utils/getRecordFormCurrencyFieldDefaultValue';
import { getRecordFormFieldPlaceholders } from '@/object-record/record-form/utils/getRecordFormFieldPlaceholders';
import { getRecordFormInvalidValueMessage } from '@/object-record/record-form/utils/getRecordFormInvalidValueMessage';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type JsonValue } from 'type-fest';
import { Field } from 'twenty-ui/primitives/input';
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
  validationRuleViolationsByFieldMetadataId?: Record<
    string,
    ValidationRuleViolation[]
  >;
  invalidFieldMetadataIdsToShow?: string[];
  onFieldValueChange: (gqlFieldName: string, value: JsonValue) => void;
  onFieldValueClear: (gqlFieldName: string) => void;
  onFieldValidityChange?: (fieldMetadataId: string, isValid: boolean) => void;
};

export const RecordFormFieldInputs = ({
  objectMetadataItem,
  fieldMetadataItems,
  draftRecord,
  validationRuleViolationsByFieldMetadataId = {},
  invalidFieldMetadataIdsToShow = [],
  onFieldValueChange,
  onFieldValueClear,
  onFieldValidityChange,
}: RecordFormFieldInputsProps) => {
  return (
    <>
      <RecordFormFieldInputsEffect
        fieldMetadataItems={fieldMetadataItems}
        draftRecord={draftRecord}
        onFieldValueChange={onFieldValueChange}
      />
      <StyledFieldList>
        {fieldMetadataItems.map((fieldMetadataItem) => {
          const gqlFieldName =
            getFieldMetadataItemGqlFieldName(fieldMetadataItem);
          const { placeholder, subFieldPlaceholders } =
            getRecordFormFieldPlaceholders(fieldMetadataItem.type);
          const invalidValueMessage = invalidFieldMetadataIdsToShow.includes(
            fieldMetadataItem.id,
          )
            ? getRecordFormInvalidValueMessage(fieldMetadataItem)
            : null;

          return (
            <Field.Root key={fieldMetadataItem.id}>
              <RecordFormFieldInput
                field={formatFieldMetadataItemAsFieldDefinition({
                  field: fieldMetadataItem,
                  objectMetadataItem,
                  showLabel: true,
                })}
                defaultValue={
                  Object.hasOwn(draftRecord, gqlFieldName)
                    ? draftRecord[gqlFieldName]
                    : (getRecordFormCurrencyFieldDefaultValue(
                        fieldMetadataItem,
                      ) ??
                      getRecordFormBooleanFieldDefaultValue(fieldMetadataItem))
                }
                onChange={(value) => onFieldValueChange(gqlFieldName, value)}
                onClear={() => onFieldValueClear(gqlFieldName)}
                onValidityChange={(isValid) =>
                  onFieldValidityChange?.(fieldMetadataItem.id, isValid)
                }
                placeholder={placeholder}
                subFieldPlaceholders={subFieldPlaceholders}
              />
              {(
                validationRuleViolationsByFieldMetadataId[
                  fieldMetadataItem.id
                ] ?? []
              ).map((violation) => (
                <Field.Error key={violation.ruleId} match role="alert">
                  {violation.message}
                </Field.Error>
              ))}
              {isNonEmptyString(invalidValueMessage) && (
                <Field.Error match role="alert">
                  {invalidValueMessage}
                </Field.Error>
              )}
            </Field.Root>
          );
        })}
      </StyledFieldList>
    </>
  );
};
