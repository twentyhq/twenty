import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputInnerContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputInnerContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { InputHint } from '@/ui/input/components/InputHint';
import { InputLabel } from '@/ui/input/components/InputLabel';
import styled from '@emotion/styled';
import { useId } from 'react';
import { Toggle } from 'twenty-ui/input';

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
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  padding-left: ${({ theme }) => theme.spacing(2)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledToggleContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-right: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  padding-right: ${({ theme }) => theme.spacing(2)};
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
      {label ? <InputLabel>{label}</InputLabel> : null}

      <FormFieldInputRowContainer>
        <FormFieldInputInnerContainer
          formFieldInputInstanceId={instanceId}
          hasRightElement
          preventFocusStackUpdate
        >
          <StyledDescription>{description}</StyledDescription>
        </FormFieldInputInnerContainer>

        <StyledToggleContainer>
          <Toggle
            value={value}
            onChange={onChange}
            disabled={disabled}
            toggleSize="small"
          />
        </StyledToggleContainer>
      </FormFieldInputRowContainer>

      {hint && <InputHint>{hint}</InputHint>}
    </FormFieldInputContainer>
  );
};
