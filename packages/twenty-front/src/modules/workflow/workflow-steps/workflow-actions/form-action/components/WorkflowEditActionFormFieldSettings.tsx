import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormFieldSettingsByType } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsByType';
import { WorkflowFormActionField } from '@/workflow/workflow-steps/workflow-actions/form-action/types/WorkflowFormActionField';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { FieldMetadataType } from 'twenty-shared';
import {
  IconSettingsAutomation,
  IconX,
  IllustrationIconNumbers,
  IllustrationIconText,
  LightIconButton,
} from 'twenty-ui';

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
  padding-inline: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: 1fr 24px;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTitleContainer = styled.div`
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
            options={[
              {
                label: getDefaultFormFieldSettings(FieldMetadataType.TEXT)
                  .label,
                value: FieldMetadataType.TEXT,
                icon: IllustrationIconText,
              },
              {
                label: getDefaultFormFieldSettings(FieldMetadataType.NUMBER)
                  .label,
                value: FieldMetadataType.NUMBER,
                icon: IllustrationIconNumbers,
              },
            ]}
            onChange={(newType: string | null) => {
              if (newType === null) {
                return;
              }

              const type = newType as
                | FieldMetadataType.TEXT
                | FieldMetadataType.NUMBER;
              const { label, placeholder } = getDefaultFormFieldSettings(type);

              onChange({
                ...field,
                type,
                label,
                placeholder,
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
