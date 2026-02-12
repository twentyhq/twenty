import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { t } from '@lingui/core/macro';
import styled from '@emotion/styled';
import camelCase from 'lodash.camelcase';
import { FieldMetadataType } from 'twenty-shared/types';

type WorkflowFormFieldSettingsSelectProps = {
  field: WorkflowFormActionField;
  onChange: (updatedField: WorkflowFormActionField) => void;
};

const StyledFormFieldSettingsSelect = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRowContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsSelect = ({
  field,
  onChange,
}: WorkflowFormFieldSettingsSelectProps) => {
  const selectTypeOptions = [
    {
      label: t`Existing Field`,
      value: 'EXISTING_FIELD',
    },
  ];

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const selectFieldId = field.settings?.selectedFieldId;

  const fieldOptions = activeNonSystemObjectMetadataItems.reduce(
    (acc, objectMetadataItem) => {
      return acc.concat(
        objectMetadataItem.fields
          .filter(
            (field) =>
              field.isActive &&
              !field.isSystem &&
              field.type === FieldMetadataType.SELECT,
          )
          .map((field) => ({
            label: `${objectMetadataItem.labelSingular} > ${field.label}`,
            value: field.id,
          })),
      );
    },
    [] as { label: string; value: string }[],
  );

  return (
    <StyledFormFieldSettingsSelect>
      <StyledRowContainer>
        <FormFieldInputContainer>
          <InputLabel>{t`Label`}</InputLabel>
          <FormTextFieldInput
            onChange={(newLabel: string) => {
              onChange({
                ...field,
                label: newLabel,
                name: camelCase(newLabel),
              });
            }}
            defaultValue={field.label}
            placeholder={
              getDefaultFormFieldSettings(FieldMetadataType.SELECT).label
            }
          />
        </FormFieldInputContainer>
        <FormFieldInputContainer>
          <InputLabel>{t`Select Type`}</InputLabel>
          <FormSelectFieldInput
            onChange={(newSelectType: string | null) => {
              if (newSelectType === null) {
                return;
              }
              onChange({
                ...field,
                settings: {
                  ...field.settings,
                  selectType: newSelectType,
                },
              });
            }}
            defaultValue={'EXISTING_FIELD'}
            options={selectTypeOptions}
            readonly
          />
        </FormFieldInputContainer>
      </StyledRowContainer>
      <FormFieldInputContainer>
        <InputLabel>{t`Field`}</InputLabel>
        <FormSelectFieldInput
          onChange={(newSelectFieldId: string | null) => {
            if (newSelectFieldId === null) {
              return;
            }
            onChange({
              ...field,
              settings: {
                ...field.settings,
                selectedFieldId: newSelectFieldId,
              },
            });
          }}
          defaultValue={selectFieldId}
          options={fieldOptions}
        />
      </FormFieldInputContainer>
    </StyledFormFieldSettingsSelect>
  );
};
