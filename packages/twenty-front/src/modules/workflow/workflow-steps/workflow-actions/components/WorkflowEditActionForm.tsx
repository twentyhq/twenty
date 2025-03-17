import { FormFieldInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputContainer';
import { FormFieldInputInputContainer } from '@/object-record/record-field/form-types/components/FormFieldInputInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/form-types/components/FormFieldInputRowContainer';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { WorkflowFormAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepHeader } from '@/workflow/workflow-steps/components/WorkflowStepHeader';
import { getActionIcon } from '@/workflow/workflow-steps/workflow-actions/utils/getActionIcon';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared';
import { IconChevronDown, IconPlus, useIcons } from 'twenty-ui';

type WorkflowEditActionFormProps = {
  action: WorkflowFormAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowFormAction) => void;
      };
};

const StyledContainer = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  font-family: inherit;
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: 100%;

  cursor: pointer;

  &:hover,
  &[data-open='true'] {
    background-color: ${({ theme }) => theme.background.transparent.lighter};
  }
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.light};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
`;

const StyledAddFieldContainer = styled.div`
  display: flex;
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  justify-content: center;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(0.5)};
`;

export const WorkflowEditActionForm = ({
  action,
  actionOptions,
}: WorkflowEditActionFormProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { t } = useLingui();
  const headerTitle = isDefined(action.name) ? action.name : `Form`;
  const headerIcon = getActionIcon(action.type);

  return (
    <>
      <WorkflowStepHeader
        onTitleChange={(newName: string) => {
          if (actionOptions.readonly === true) {
            return;
          }

          actionOptions.onActionUpdate({
            ...action,
            name: newName,
          });
        }}
        Icon={getIcon(headerIcon)}
        iconColor={theme.font.color.tertiary}
        initialTitle={headerTitle}
        headerType="Action"
        disabled={actionOptions.readonly}
      />
      <WorkflowStepBody>
        {action.settings.input.map((field) => (
          <FormFieldInputContainer key={field.name}>
            {field.label ? <InputLabel>{field.label}</InputLabel> : null}

            <FormFieldInputRowContainer>
              <FormFieldInputInputContainer hasRightElement={false}>
                <StyledContainer onClick={() => {}}>
                  <StyledPlaceholder>{field.placeholder}</StyledPlaceholder>
                  <IconChevronDown
                    size={theme.icon.size.md}
                    color={theme.font.color.tertiary}
                  />
                </StyledContainer>
              </FormFieldInputInputContainer>
            </FormFieldInputRowContainer>
          </FormFieldInputContainer>
        ))}
        {!actionOptions.readonly && (
          <FormFieldInputContainer>
            <FormFieldInputRowContainer>
              <FormFieldInputInputContainer hasRightElement={false}>
                <StyledContainer onClick={() => {}}>
                  <StyledAddFieldContainer>
                    <IconPlus size={theme.icon.size.sm} />
                    {t`Add Field`}
                  </StyledAddFieldContainer>
                </StyledContainer>
              </FormFieldInputInputContainer>
            </FormFieldInputRowContainer>
          </FormFieldInputContainer>
        )}
      </WorkflowStepBody>
    </>
  );
};
