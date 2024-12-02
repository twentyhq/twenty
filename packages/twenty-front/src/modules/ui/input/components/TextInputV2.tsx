import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  ChangeEvent,
  FocusEventHandler,
  ForwardedRef,
  InputHTMLAttributes,
  forwardRef,
  useId,
  useRef,
  useState,
} from 'react';
import { IconComponent, IconEye, IconEyeOff, RGBA } from 'twenty-ui';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { InputLabel } from './InputLabel';

const StyledContainer = styled.div<
  Pick<TextInputV2ComponentProps, 'fullWidth'>
>`
  display: inline-flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? `100%` : 'auto')};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
`;

const StyledInput = styled.input<
  Pick<TextInputV2ComponentProps, 'fullWidth' | 'LeftIcon' | 'error'>
>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid
    ${({ theme, error }) =>
      error ? theme.border.color.danger : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${({ theme }) => theme.font.family};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  height: 32px;
  outline: none;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme, LeftIcon }) =>
    LeftIcon ? `calc(${theme.spacing(4)} + 16px)` : theme.spacing(2)};
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

  &:focus {
    ${({ theme }) => {
      return `box-shadow: 0px 0px 0px 3px ${RGBA(theme.color.blue, 0.1)};
      border-color: ${theme.color.blue};`;
    }};
  }
`;

const StyledErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledLeftIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-left: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
`;

const StyledTrailingIconContainer = styled.div<
  Pick<TextInputV2ComponentProps, 'error'>
>`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  margin: auto 0;
`;

const StyledTrailingIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  justify-content: center;
`;

const INPUT_TYPE_PASSWORD = 'password';

export type TextInputV2ComponentProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'onKeyDown'
> & {
  className?: string;
  label?: string;
  onChange?: (text: string) => void;
  fullWidth?: boolean;
  error?: string;
  noErrorHelper?: boolean;
  RightIcon?: IconComponent;
  LeftIcon?: IconComponent;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  dataTestId?: string;
};

const TextInputV2Component = (
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
    noErrorHelper = false,
    required,
    type,
    autoFocus,
    placeholder,
    disabled,
    tabIndex,
    RightIcon,
    LeftIcon,
    autoComplete,
    maxLength,
    dataTestId,
  }: TextInputV2ComponentProps,
  // eslint-disable-next-line @nx/workspace-component-props-naming
  ref: ForwardedRef<HTMLInputElement>,
): JSX.Element => {
  const theme = useTheme();

  const inputRef = useRef<HTMLInputElement>(null);
  const combinedRef = useCombinedRefs(ref, inputRef);

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const inputId = useId();

  return (
    <StyledContainer className={className} fullWidth={fullWidth ?? false}>
      {label && (
        <InputLabel htmlFor={inputId}>
          {label + (required ? '*' : '')}
        </InputLabel>
      )}
      <StyledInputContainer>
        {!!LeftIcon && (
          <StyledLeftIconContainer>
            <StyledTrailingIcon>
              <LeftIcon size={theme.icon.size.md} />
            </StyledTrailingIcon>
          </StyledLeftIconContainer>
        )}
        <StyledInput
          id={inputId}
          data-testid={dataTestId}
          autoComplete={autoComplete || 'off'}
          ref={combinedRef}
          tabIndex={tabIndex ?? 0}
          onFocus={onFocus}
          onBlur={onBlur}
          type={passwordVisible ? 'text' : type}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange?.(
              turnIntoEmptyStringIfWhitespacesOnly(event.target.value),
            );
          }}
          onKeyDown={onKeyDown}
          {...{
            autoFocus,
            disabled,
            placeholder,
            required,
            value,
            LeftIcon,
            maxLength,
            error,
          }}
        />
        <StyledTrailingIconContainer {...{ error }}>
          {!error && type === INPUT_TYPE_PASSWORD && (
            <StyledTrailingIcon
              onClick={handleTogglePasswordVisibility}
              data-testid="reveal-password-button"
            >
              {passwordVisible ? (
                <IconEyeOff size={theme.icon.size.md} />
              ) : (
                <IconEye size={theme.icon.size.md} />
              )}
            </StyledTrailingIcon>
          )}
          {!error && type !== INPUT_TYPE_PASSWORD && !!RightIcon && (
            <StyledTrailingIcon>
              <RightIcon size={theme.icon.size.md} />
            </StyledTrailingIcon>
          )}
        </StyledTrailingIconContainer>
      </StyledInputContainer>
      {error && !noErrorHelper && (
        <StyledErrorHelper>{error}</StyledErrorHelper>
      )}
    </StyledContainer>
  );
};

export const TextInputV2 = forwardRef(TextInputV2Component);
