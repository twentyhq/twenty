import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowEditActionFormProps } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowEditActionForm';
import { WorkflowFormFieldSettingsByType } from '@/workflow/workflow-steps/workflow-actions/form-action/components/WorkflowFormFieldSettingsByType';
import { getDefaultFormFieldSettings } from '@/workflow/workflow-steps/workflow-actions/form-action/utils/getDefaultFormFieldSettings';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';
import {
  IconSettingsAutomation,
  IconX,
  IllustrationIconNumbers,
  IllustrationIconText,
  LightIconButton,
} from 'twenty-ui';

type WorkflowEditActionFormFieldSettingsProps = WorkflowEditActionFormProps & {
  field: WorkflowFormActionField;
  onClose: () => void;
};

export type WorkflowFormActionField = {
  id: string;
  label: string;
  type: FieldMetadataType;
  placeholder?: string;
  settings?: Record<string, unknown>;
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
  action,
  actionOptions,
  field,
  onClose,
}: WorkflowEditActionFormFieldSettingsProps) => {
  const theme = useTheme();
  const onFieldUpdate = (id: string, field: string, value: any) => {
    if (actionOptions.readonly === true) {
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: action.settings.input.map((f) => {
          if (f.id !== id) {
            return f;
          }

          return {
            ...f,
            [field]: value,
          };
        }),
      },
    });
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
            onClick={() => {
              onClose?.();
            }}
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
            onPersist={(newType: string | null) => {
              if (actionOptions.readonly === true) {
                return;
              }

              if (newType === null) {
                return;
              }

              actionOptions.onActionUpdate({
                ...action,
                settings: {
                  ...action.settings,
                  input: action.settings.input.map((f) => {
                    if (f.id !== field.id) {
                      return f;
                    }

                    const type = newType as FieldMetadataType;
                    const { label, placeholder } =
                      getDefaultFormFieldSettings(type);

                    return {
                      ...f,
                      type,
                      label,
                      placeholder,
                    };
                  }),
                },
              });
            }}
            defaultValue={field.type}
            preventDisplayPadding
          />
        </FormFieldInputContainer>
        <WorkflowFormFieldSettingsByType
          field={field}
          onFieldUpdate={onFieldUpdate}
        />
      </StyledSettingsContent>
    </StyledFormFieldSettingsContainer>
  );
};
