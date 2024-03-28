import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  useRef,
} from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconAlertCircle } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';

const StyledContainer = styled.div<Pick<TextInputComponentProps, 'fullWidth'>>`
  display: inline-flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? `100%` : 'auto')};
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

const StyledInput = styled.input<Pick<TextInputComponentProps, 'fullWidth'>>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-right: none;
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: 32px;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
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

const StyledErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledTrailingIconContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-bottom-right-radius: ${({ theme }) => theme.border.radius.sm};
  border-left: none;
  border-top-right-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTrailingIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  justify-content: center;
`;

export type TextInputComponentProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onKeyDown'
> & {
  className?: string;
  label?: string;
  onChange?: (text: string) => void;
  fullWidth?: boolean;
  disableHotkeys?: boolean;
  error?: string;
  RightIcon?: IconComponent;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
};

const TextInputComponent = (
  {
    className,
    label,
    value,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    fullWidth,
    error,
    required,
    autoFocus,
    placeholder,
    disabled,
    tabIndex,
  }: TextInputComponentProps,
  // eslint-disable-next-line @nx/workspace-component-props-naming
  ref: ForwardedRef<HTMLInputElement>,
): JSX.Element => {
  const theme = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);
  const combinedRef = useCombinedRefs(ref, inputRef);

  const handleClick = () => {
    inputRef.current?.focus();
  };

  return (
    <StyledContainer
      className={className}
      fullWidth={fullWidth ?? false}
      onClick={handleClick}
    >
      {label && (
        <StyledLabel onClick={handleClick}>
          {label + (required ? '*' : '')}
        </StyledLabel>
      )}
      <StyledInputContainer onClick={handleClick}>
        <StyledInput
          autoComplete="off"
          ref={combinedRef}
          tabIndex={tabIndex ?? 0}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange?.(event.target.value);
          }}
          onKeyDown={onKeyDown}
          {...{ autoFocus, disabled, placeholder, required, value }}
        />
        <StyledTrailingIconContainer>
          {error && (
            <StyledTrailingIcon>
              <IconAlertCircle size={16} color={theme.color.red} />
            </StyledTrailingIcon>
          )}
        </StyledTrailingIconContainer>
      </StyledInputContainer>
      {error && <StyledErrorHelper>{error}</StyledErrorHelper>}
    </StyledContainer>
  );
};

export const TextInputRaw = forwardRef(TextInputComponent);
