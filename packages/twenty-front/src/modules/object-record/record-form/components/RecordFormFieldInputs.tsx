import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { getRecordFormFieldInputSettings } from '@/object-record/record-form/utils/getRecordFormFieldInputSettings';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { type JsonValue } from 'type-fest';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFieldList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFieldErrorMessage = styled.div`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  margin-top: ${themeCssVariables.spacing[1]};
`;

type RecordFormFieldInputsProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItems: FieldMetadataItem[];
  draftRecord: Partial<ObjectRecord>;
  onFieldValueChange: (gqlFieldName: string, value: JsonValue) => void;
  onFieldValueClear: (gqlFieldName: string) => void;
  errorMessageByFieldMetadataId?: Record<string, string>;
};

export const RecordFormFieldInputs = ({
  objectMetadataItem,
  fieldMetadataItems,
  draftRecord,
  onFieldValueChange,
  onFieldValueClear,
  errorMessageByFieldMetadataId = {},
}: RecordFormFieldInputsProps) => (
  <StyledFieldList>
    {fieldMetadataItems.map((fieldMetadataItem) => {
      const gqlFieldName = getFieldMetadataItemGqlFieldName(fieldMetadataItem);

      const errorMessage = errorMessageByFieldMetadataId[fieldMetadataItem.id];

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
          {isDefined(errorMessage) && (
            <StyledFieldErrorMessage>{errorMessage}</StyledFieldErrorMessage>
          )}
        </div>
      );
    })}
  </StyledFieldList>
);
