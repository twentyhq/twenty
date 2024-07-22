import styled from '@emotion/styled';
import {
  ChangeEvent,
  FocusEventHandler,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';
import { IconComponent } from 'twenty-ui';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';

const StyledContainer = styled.div<
  Pick<EditableFieldComponentProps, 'fullWidth'>
>`
  display: inline-flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const StyledInput = styled.input<
  Pick<EditableFieldComponentProps, 'fullWidth' | 'error'>
>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid
    ${({ theme, error }) =>
      error ? theme.border.color.danger : theme.border.color.editable};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => `0 0 4px ${theme.boxShadow.editable}`};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: 24px; // Match Figma height if different
  outline: none;
  padding: ${({ theme }) => theme.spacing(0, 2, 0, 2)};
  width: 100%;
  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export type EditableFieldComponentProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onKeyDown'
> & {
  className?: string;
  label?: string;
  onChange?: (text: string) => void;
  onUpdate?: (value: string) => void;
  fullWidth?: boolean;
  error?: string;
  noErrorHelper?: boolean;
  RightIcon?: IconComponent;
  LeftIcon?: IconComponent;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  initialValue: string;
};

const EditableFieldComponent = (
  {
    className,
    label,
    onChange,
    onUpdate,
    onFocus,
    onBlur,
    fullWidth,
    error,
    required,
    autoFocus,
    placeholder,
    disabled,
    tabIndex,
    autoComplete,
    maxLength,
    initialValue,
  }: EditableFieldComponentProps,
  // eslint-disable-next-line @nx/workspace-component-props-naming
  ref: ForwardedRef<HTMLInputElement>,
): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null);
  const combinedRef = useCombinedRefs(ref, inputRef);
  const [inputValue, setInputValue] = useState(initialValue);
  const [isInitiallyFocused, setIsInitiallyFocused] = useState(false);

  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (
      Boolean(autoFocus) &&
      Boolean(inputRef.current) &&
      Boolean(!isInitiallyFocused)
    ) {
      inputRef.current?.focus();
      inputRef.current?.select();
      setIsInitiallyFocused(true);
    }
  }, [autoFocus, isInitiallyFocused]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setInputValue(text);
    onChange?.(text);
  };

  const handleInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    onUpdate?.(inputValue);
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onUpdate?.(inputValue);
    }
  };
  return (
    <StyledContainer className={className} fullWidth={fullWidth ?? false}>
      {label && <StyledLabel>{label + (required ? '*' : '')}</StyledLabel>}
      <StyledInputContainer>
        <StyledInput
          autoComplete={autoComplete || 'off'}
          ref={combinedRef}
          tabIndex={tabIndex ?? 0}
          onFocus={onFocus}
          onBlur={handleInputBlur}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          {...{
            autoFocus,
            disabled,
            placeholder,
            required,
            value: inputValue,
            maxLength,
            error,
          }}
        />
      </StyledInputContainer>
    </StyledContainer>
  );
};

export const EditableField = forwardRef(EditableFieldComponent);
