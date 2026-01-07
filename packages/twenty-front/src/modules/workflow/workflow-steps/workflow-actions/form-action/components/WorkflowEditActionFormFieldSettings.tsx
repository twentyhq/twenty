import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormFieldSettingsByType } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsByType';
import { FORM_SELECT_FIELD_TYPE_OPTIONS } from '@/workflow/workflow-steps/workflow-actions/form-action/constants/FormSelectFieldTypeOptions';
import { type WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { type WorkflowFormFieldType } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormFieldType';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { IconSettingsAutomation, IconX } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

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
  padding-bottom: ${({ theme }) => theme.spacing(2)};
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
