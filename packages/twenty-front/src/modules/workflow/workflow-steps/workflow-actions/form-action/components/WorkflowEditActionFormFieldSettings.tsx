import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormFieldSettingsByType } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsByType';
import { FORM_SELECT_FIELD_TYPE_OPTIONS } from '@/workflow/workflow-steps/workflow-actions/form-action/constants/FormSelectFieldTypeOptions';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { IconSettingsAutomation, IconX, LightIconButton } from 'twenty-ui';

type WorkflowEditActionFormFieldSettingsProps = {
  field: WorkflowFormActionField;
  onChange: (field: WorkflowFormActionField) => void;
  onClose: () => void;
};

const StyledFormFieldSettingsContainer = styled.div`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledSettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledSettingsHeader = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: grid;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 24px;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTitleContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledCloseButtonContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowEditActionFormFieldSettings = ({
  field,
  onChange,
  onClose,
}: WorkflowEditActionFormFieldSettingsProps) => {
  const theme = useTheme();
  const onSubFieldUpdate = (fieldName: string, value: any) => {
    if (fieldName === 'label') {
      onChange({
        ...field,
        name: camelCase(value),
        label: value,
      });
    } else {
      onChange({
        ...field,
        [fieldName]: value,
      });
    }
  };

  return (
    <StyledFormFieldSettingsContainer>
      <StyledSettingsHeader>
        <StyledTitleContainer>
          <IconSettingsAutomation
            size={theme.icon.size.md}
            color={theme.font.color.primary}
          />
          {t`Input settings`}
        </StyledTitleContainer>
        <StyledCloseButtonContainer>
          <LightIconButton
            testId="close-button"
            Icon={IconX}
            size="small"
            accent="secondary"
            onClick={onClose}
          />
        </StyledCloseButtonContainer>
      </StyledSettingsHeader>
      <StyledSettingsContent>
        <FormFieldInputContainer>
          <InputLabel>Type</InputLabel>
          <FormSelectFieldInput
            options={FORM_SELECT_FIELD_TYPE_OPTIONS}
            onChange={(newType: string | null) => {
              if (newType === null) {
                return;
              }

              const type = newType as WorkflowFormFieldType;
              const { name, label, placeholder, settings } =
                getDefaultFormFieldSettings(type);

              onChange({
                ...field,
                type,
                name,
                label,
                placeholder,
                settings,
              });
            }}
            defaultValue={field.type}
            preventDisplayPadding
          />
        </FormFieldInputContainer>
        <WorkflowFormFieldSettingsByType
          field={field}
          onChange={onSubFieldUpdate}
        />
      </StyledSettingsContent>
    </StyledFormFieldSettingsContainer>
  );
};
