import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { getFieldMetadataItemGqlFieldName } from '@/object-metadata/utils/getFieldMetadataItemGqlFieldName';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { styled } from '@linaria/react';
import { type JsonValue } from 'type-fest';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
}: RecordFormFieldInputsProps) => (
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
          defaultValue={draftRecord[gqlFieldName]}
          onChange={(value) => onFieldValueChange(gqlFieldName, value)}
          onClear={() => onFieldValueClear(gqlFieldName)}
        />
      );
    })}
  </StyledFieldList>
);
