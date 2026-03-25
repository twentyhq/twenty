import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormFieldSettingsByType } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsByType';
import { FORM_SELECT_FIELD_TYPE_OPTIONS } from '@/workflow/workflow-steps/workflow-actions/form-action/constants/FormSelectFieldTypeOptions';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconSettingsAutomation, IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
import { useContext } from 'react';
type WorkflowEditActionFormFieldSettingsProps = {
  field: WorkflowFormActionField;
  onChange: (field: WorkflowFormActionField) => void;
  onClose: () => void;
};

const StyledFormFieldSettingsContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[3]};
`;

const StyledSettingsContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledSettingsHeader = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: 1fr 24px;
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[3]};
  padding-right: ${themeCssVariables.spacing[2]};
`;

const StyledTitleContainer = styled.div`
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[3]};
`;

const StyledCloseButtonContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const WorkflowEditActionFormFieldSettings = ({
  field,
  onChange,
  onClose,
}: WorkflowEditActionFormFieldSettingsProps) => {
  const { theme } = useContext(ThemeContext);

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
          <InputLabel>{t`Type`}</InputLabel>
          <FormSelectFieldInput
            options={FORM_SELECT_FIELD_TYPE_OPTIONS}
            onChange={(newType: string | null) => {
              if (newType === null) {
                return;
              }

              const type = newType as WorkflowFormFieldType;
              const { name, label, settings } =
                getDefaultFormFieldSettings(type);

              onChange({
                ...field,
                type,
                name,
                label,
                settings,
                placeholder: '',
              });
            }}
            defaultValue={field.type}
          />
        </FormFieldInputContainer>
        <WorkflowFormFieldSettingsByType field={field} onChange={onChange} />
      </StyledSettingsContent>
    </StyledFormFieldSettingsContainer>
  );
};
