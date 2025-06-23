import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import styled from '@emotion/styled';
import camelCase from 'lodash.camelcase';
import { useIcons } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useTheme } from '@emotion/react';

type WorkflowFormFieldSettingsRecordPickerProps = {
  field: WorkflowFormActionField;
  onChange: (updatedField: WorkflowFormActionField) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsRecordPicker = ({
  field,
  onChange,
}: WorkflowFormFieldSettingsRecordPickerProps) => {
  const theme = useTheme();

  const { getIcon } = useIcons();

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeNonSystemObjectMetadataItems.map((item) => ({
      Icon: getIcon(item.icon),
      label: item.labelPlural,
      value: item.nameSingular,
    }));

  return (
    <StyledContainer>
      <FormFieldInputContainer>
        <Select
          dropdownId="workflow-form-field-settings-record-picker-object-name"
          label="Object"
          fullWidth
          value={field.settings?.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            onChange({
              ...field,
              placeholder: `Select a ${
                activeNonSystemObjectMetadataItems.find(
                  (item) => item.nameSingular === updatedObjectName,
                )?.labelSingular || 'record'
              }`,
              settings: {
                ...field.settings,
                objectName: updatedObjectName,
              },
            });
          }}
          withSearchInput
          dropdownOffset={{ y: parseInt(theme.spacing(1), 10) }}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
        />
      </FormFieldInputContainer>
      <FormFieldInputContainer>
        <InputLabel>Label</InputLabel>
        <FormTextFieldInput
          onChange={(newLabel: string) => {
            onChange({
              ...field,
              label: newLabel,
              name: camelCase(newLabel),
            });
          }}
          defaultValue={field.label}
          placeholder={getDefaultFormFieldSettings('RECORD').label}
        />
      </FormFieldInputContainer>
    </StyledContainer>
  );
};
