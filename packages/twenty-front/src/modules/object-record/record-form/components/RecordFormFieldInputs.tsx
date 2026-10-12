import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { getRecordFormFieldInputSettings } from '@/object-record/record-form/utils/getRecordFormFieldInputSettings';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ValidationRuleViolation } from '@/validation-rules/types/ValidationRuleViolation';
import { styled } from '@linaria/react';
import { type JsonValue } from 'type-fest';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFieldViolation = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[0.5]};
`;

type RecordFormFieldInputsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
  draftRecord: Partial<ObjectRecord>;
  validationRuleViolationsByFieldMetadataId?: Record<
    string,
    ValidationRuleViolation[]
  >;
  onFieldValueChange: (gqlFieldName: string, value: JsonValue) => void;
  onFieldValueClear: (gqlFieldName: string) => void;
};

export const RecordFormFieldInputs = ({
  objectMetadataItem,
  fieldMetadataItems,
  draftRecord,
  validationRuleViolationsByFieldMetadataId = {},
  onFieldValueChange,
  onFieldValueClear,
}: RecordFormFieldInputsProps) => (
  <StyledFieldList>
    {fieldMetadataItems.map((fieldMetadataItem) => {
      const gqlFieldName = getFieldMetadataItemGqlFieldName(fieldMetadataItem);

      return (
        <div key={fieldMetadataItem.id}>
          <FormFieldInput
            field={formatFieldMetadataItemAsFieldDefinition({
              field: fieldMetadataItem,
              objectMetadataItem,
              showLabel: true,
            })}
            defaultValue={draftRecord[gqlFieldName]}
            onChange={(value) => onFieldValueChange(gqlFieldName, value)}
            onClear={() => onFieldValueClear(gqlFieldName)}
            settings={getRecordFormFieldInputSettings(fieldMetadataItem.type)}
          />
          {(
            validationRuleViolationsByFieldMetadataId[fieldMetadataItem.id] ??
            []
          ).map((violation) => (
            <StyledFieldViolation key={violation.ruleId} role="alert">
              {violation.message}
            </StyledFieldViolation>
          ))}
        </div>
      );
    })}
  </StyledFieldList>
);
