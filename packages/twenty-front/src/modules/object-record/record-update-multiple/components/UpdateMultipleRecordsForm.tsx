import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { type UpdateMultipleRecordsState } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsContainer';
import { isUpdateRecordValueEmpty } from '@/object-record/record-update-multiple/utils/isUpdateRecordValueEmpty';
import { shouldDisplayFormMultiEditField } from '@/object-record/record-update-multiple/utils/shouldDisplayFormMultiEditField';
import styled from '@emotion/styled';
import { FieldMetadataType } from 'twenty-shared/types';
import { Section } from 'twenty-ui/layout';

const StyledSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  width: auto;
`;

export type UpdateMultipleRecordsFormProps = {
  objectNameSingular: string;
  disabled?: boolean;
  values: UpdateMultipleRecordsState;
  onChange: (fieldName: string, value: any) => void;
};

export const UpdateMultipleRecordsForm = ({
  objectNameSingular,
  disabled = false,
  values,
  onChange,
}: UpdateMultipleRecordsFormProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const editableFields = objectMetadataItem.fields
    .filter(shouldDisplayFormMultiEditField)
    .sort((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name));

  const fieldsWithDefinitions = editableFields.map((fieldMetadataItem) => ({
    fieldMetadataItem,
    fieldDefinition: formatFieldMetadataItemAsFieldDefinition({
      field: fieldMetadataItem,
      objectMetadataItem,
      showLabel: true,
      labelWidth: 90,
    }),
  }));

  return (
    <StyledSection>
      {fieldsWithDefinitions.map(({ fieldMetadataItem, fieldDefinition }) => {
        const fieldName = fieldDefinition.metadata.fieldName;
        const isRelation = isFieldRelation(fieldDefinition);
        const fieldNameOrRelationIdName =
          isRelation && fieldMetadataItem.type === FieldMetadataType.RELATION
            ? (fieldMetadataItem.settings?.joinColumnName as string)
            : fieldName;

        const value = values[fieldNameOrRelationIdName];

        const handleValueChange = (newValue: any) => {
          if (isUpdateRecordValueEmpty(newValue)) {
            onChange(fieldNameOrRelationIdName, undefined);
          } else {
            onChange(fieldNameOrRelationIdName, newValue);
          }
        };

        return (
          <FormFieldInput
            key={fieldDefinition.metadata.fieldName}
            readonly={disabled}
            field={fieldDefinition}
            defaultValue={value}
            onChange={handleValueChange}
          />
        );
      })}
    </StyledSection>
  );
};
