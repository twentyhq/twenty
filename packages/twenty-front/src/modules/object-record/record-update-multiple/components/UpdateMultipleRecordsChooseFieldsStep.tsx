import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { formatFieldMetadataItemAsFieldDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsFieldDefinition';
import { FormFieldInput } from '@/object-record/record-field/ui/components/FormFieldInput';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { shouldDisplayFormField } from '@/workflow/workflow-steps/workflow-actions/utils/shouldDisplayFormField';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { HorizontalSeparator } from 'twenty-ui/display';
import { Checkbox } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledSection = styled(Section)`
  margin: ${({ theme }) => theme.spacing(4)};
  width: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledFieldRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledLabel = styled.span`
  display: block;
  color: ${({ theme }) => theme.font.color.secondary};
`;

type UpdateMultipleRecordsChooseFieldsStepProps = {
  disabled?: boolean;
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
};

export const UpdateMultipleRecordsChooseFieldsStep = ({
  disabled = false,
  values,
  onChange,
}: UpdateMultipleRecordsChooseFieldsStepProps) => {
  const { t } = useLingui();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const handleCheckboxChange = (fieldName: string, checked: boolean) => {
    if (checked) {
      onChange(fieldName, null);
    } else {
      onChange(fieldName, undefined);
    }
  };

  const handleValueChange = (fieldName: string, value: any) => {
    onChange(fieldName, value);
  };

  const inlineFieldMetadataItems = objectMetadataItem?.fields
    .filter((fieldMetadataItem) =>
      shouldDisplayFormField({
        fieldMetadataItem,
        actionType: 'UPDATE_RECORD',
      }),
    )
    .sort((fieldMetadataItemA, fieldMetadataItemB) =>
      fieldMetadataItemA.name.localeCompare(fieldMetadataItemB.name),
    );

  const inlineFieldDefinitions = isDefined(objectMetadataItem)
    ? inlineFieldMetadataItems?.map((fieldMetadataItem) =>
        formatFieldMetadataItemAsFieldDefinition({
          field: fieldMetadataItem,
          objectMetadataItem,
          showLabel: true,
          labelWidth: 90,
        }),
      )
    : [];

  return (
    <StyledSection>
      <StyledLabel>
        {t`Select the fields you want to update for the selected records.`}
      </StyledLabel>

      <HorizontalSeparator noMargin />

      {inlineFieldMetadataItems.map((field) => {
        const isSelected = values[field.name] !== undefined;

        const fieldDefinition = inlineFieldDefinitions.find((definition) => {
          const isFieldRelationManyToOne =
            isFieldRelation(definition) &&
            definition.metadata.relationType === RelationType.MANY_TO_ONE;

          const value = isFieldRelationManyToOne
            ? `${definition.metadata.fieldName}Id`
            : definition.metadata.fieldName;

          return value === field.name;
        });

        if (!isDefined(fieldDefinition)) {
          return null;
        }

        return (
          <StyledFieldRow key={`${field.id}-selected-${isSelected}`}>
            <Checkbox
              disabled={disabled}
              checked={isSelected}
              onChange={(event) =>
                handleCheckboxChange(field.name, !!event.target.checked)
              }
            />
            <FormFieldInput
              readonly={!isSelected || disabled}
              field={fieldDefinition}
              defaultValue={values[field.name]}
              onChange={(value) => handleValueChange(field.name, value)}
            />
          </StyledFieldRow>
        );
      })}
    </StyledSection>
  );
};
