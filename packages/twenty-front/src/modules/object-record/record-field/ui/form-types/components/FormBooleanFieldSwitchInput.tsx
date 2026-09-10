import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { Field, Switch } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { useId } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type FormBooleanFieldSwitchInputProps = {
  label?: string;
  description: string;
  hint?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

const StyledDescription = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledSwitchContainer = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  border-bottom-right-radius: ${themeCssVariables.border.radius.md};
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  border-top-right-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-right: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const FormBooleanFieldSwitchInput = ({
  label,
  description,
  hint,
  value,
  onChange,
  disabled,
}: FormBooleanFieldSwitchInputProps) => {
  const instanceId = useId();
  const descriptionId = `${instanceId}-description`;

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement
          preventFocusStackUpdate
        >
          <StyledDescription id={descriptionId}>
            {description}
          </StyledDescription>
        </FormFieldInputInnerContainer>

        <StyledSwitchContainer>
          <Switch
            aria-labelledby={descriptionId}
            checked={value}
            onCheckedChange={(checked) => onChange(checked)}
            disabled={disabled}
            size="sm"
          />
        </StyledSwitchContainer>
      </FormFieldInputRowContainer>

      {hint && <Field.Description>{hint}</Field.Description>}
    </FormFieldInputContainer>
  );
};
