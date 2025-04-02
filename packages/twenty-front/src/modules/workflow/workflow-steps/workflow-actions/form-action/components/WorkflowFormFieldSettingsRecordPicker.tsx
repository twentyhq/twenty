import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import styled from '@emotion/styled';
import { SelectOption, useIcons } from 'twenty-ui';

type WorkflowFormFieldSettingsRecordPickerProps = {
  label?: string;
  settings?: Record<string, any>;
  onChange: (fieldName: string, value: unknown) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowFormFieldSettingsRecordPicker = ({
  label,
  settings,
  onChange,
}: WorkflowFormFieldSettingsRecordPickerProps) => {
  const { getIcon } = useIcons();

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const availableMetadata: Array<SelectOption<string>> =
    activeObjectMetadataItems.map((item) => ({
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
          value={settings?.objectName}
          emptyOption={{ label: 'Select an option', value: '' }}
          options={availableMetadata}
          onChange={(updatedObjectName) => {
            onChange('settings', {
              ...settings,
              objectName: updatedObjectName,
            });
          }}
          withSearchInput
        />
      </FormFieldInputContainer>
      <FormFieldInputContainer>
        <InputLabel>Label</InputLabel>
        <FormTextFieldInput
          onChange={(newLabel: string | null) => {
            onChange('label', newLabel);
          }}
          defaultValue={label}
          placeholder={getDefaultFormFieldSettings('RECORD').label}
        />
      </FormFieldInputContainer>
    </StyledContainer>
  );
};
