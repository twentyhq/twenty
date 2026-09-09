import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { Field, Switch } from 'twenty-ui/input';
import { styled } from '@linaria/react';
import { useId } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type FormBooleanFieldToggleInputProps = {
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

const StyledToggleContainer = styled.div`
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

export const FormBooleanFieldToggleInput = ({
  label,
  description,
  hint,
  value,
  onChange,
  disabled,
}: FormBooleanFieldToggleInputProps) => {
  const instanceId = useId();

  return (
    <FormFieldInputContainer>
      {label ? <Field.Label>{label}</Field.Label> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement
          preventFocusStackUpdate
        >
          <StyledDescription>{description}</StyledDescription>
        </FormFieldInputInnerContainer>

        <StyledToggleContainer>
          <Switch
            aria-label={label ?? description}
            checked={value}
            onCheckedChange={onChange}
            disabled={disabled}
            size="sm"
          />
        </StyledToggleContainer>
      </FormFieldInputRowContainer>

      {hint && <Field.Description>{hint}</Field.Description>}
    </FormFieldInputContainer>
  );
};
