import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import {
  type ChangeEvent,
  type FocusEventHandler,
  type InputHTMLAttributes,
  forwardRef,
  useId,
  useRef,
  useState,
} from 'react';
import { type IconComponent, IconEye, IconEyeOff } from 'twenty-ui/display';
import { AutogrowWrapper } from 'twenty-ui/utilities';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

const StyledContainer = styled.div<Pick<TextInputComponentProps, 'fullWidth'>>`
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? `100%` : 'auto')};
  position: relative;
`;

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: inherit;
  display: flex;
  flex-direction: row;
  position: relative;
`;

type StyledAdornmentContainerProps = {
  sizeVariant: TextInputSize;
  position: 'left' | 'right';
};

const StyledAdornmentContainer = styled.div<StyledAdornmentContainerProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.light};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme, position }) =>
    position === 'left'
      ? `${theme.border.radius.sm} 0 0 ${theme.border.radius.sm}`
      : `0 ${theme.border.radius.sm} ${theme.border.radius.sm} 0`};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};
  justify-content: center;
  min-width: fit-content;
  padding: ${({ theme }) => theme.spacing(2)};
  width: auto;
  line-height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};

  ${({ position }) =>
    position === 'left' ? 'border-right: none;' : 'border-left: none;'}
`;

const StyledInput = styled.input<
  Pick<
    TextInputComponentProps,
    | 'LeftIcon'
    | 'RightIcon'
    | 'error'
    | 'sizeVariant'
    | 'width'
    | 'inheritFontStyles'
    | 'autoGrow'
    | 'rightAdornment'
    | 'leftAdornment'
  >
>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme, leftAdornment, rightAdornment }) =>
    leftAdornment
      ? `0 ${theme.border.radius.sm} ${theme.border.radius.sm} 0`
      : rightAdornment
        ? `${theme.border.radius.sm} 0 0 ${theme.border.radius.sm}`
        : theme.border.radius.sm};

  border: 1px solid
    ${({ theme, error }) =>
      error ? theme.border.color.danger : theme.border.color.medium};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${({ theme, inheritFontStyles }) =>
    inheritFontStyles ? 'inherit' : theme.font.family};
  font-size: ${({ theme, inheritFontStyles }) =>
    inheritFontStyles ? 'inherit' : theme.font.size.md};
  font-weight: ${({ theme, inheritFontStyles }) =>
    inheritFontStyles ? 'inherit' : theme.font.weight.regular};
  height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};
  outline: none;
  padding: ${({ theme, sizeVariant, autoGrow }) =>
    autoGrow
      ? 0
      : sizeVariant === 'xs'
        ? `${theme.spacing(2)} 0`
        : theme.spacing(2)};
  padding-left: ${({ theme, LeftIcon, autoGrow }) =>
    autoGrow
      ? theme.spacing(1)
      : LeftIcon
        ? `calc(${theme.spacing(3)} + 16px)`
        : theme.spacing(2)};
  padding-right: ${({ theme, RightIcon, autoGrow }) =>
    autoGrow
      ? theme.spacing(1)
      : RightIcon
        ? `calc(${theme.spacing(3)} + 16px)`
        : theme.spacing(2)};
  width: ${({ theme, width }) =>
    width ? `calc(${width}px + ${theme.spacing(0.5)})` : '100%'};
  max-width: ${({ autoGrow }) => (autoGrow ? '100%' : 'none')};
  text-overflow: ellipsis;
  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  &[readonly] {
    pointer-events: none;
  }

  &:focus {
    ${({ theme, error }) => {
      return `
      border-color: ${error ? theme.border.color.danger : theme.color.blue};
      `;
    }};
  }
`;

const StyledLeftIconContainer = styled.div<{ sizeVariant: TextInputSize }>`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-left: ${({ theme, sizeVariant }) =>
    sizeVariant === 'xs'
      ? theme.spacing(0.5)
      : sizeVariant === 'md' || sizeVariant === 'sm'
        ? theme.spacing(1)
        : theme.spacing(2)};
  position: absolute;
  top: 0;
  bottom: 0;
  margin: auto 0;
`;

const StyledTrailingIconContainer = styled.div<
  Pick<TextInputComponentProps, 'error'>
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

const StyledTrailingIcon = styled.div<{
  isFocused?: boolean;
  onClick?: () => void;
}>`
  align-items: center;
  color: ${({ theme, isFocused }) =>
    isFocused ? theme.font.color.secondary : theme.font.color.light};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
  display: flex;
  justify-content: center;
`;

const INPUT_TYPE_PASSWORD = 'password';

export type TextInputSize = 'xs' | 'sm' | 'md' | 'lg';

export type TextInputComponentProps = Omit<
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
  onRightIconClick?: () => void;
  LeftIcon?: IconComponent;
  autoGrow?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  dataTestId?: string;
  sizeVariant?: TextInputSize;
  inheritFontStyles?: boolean;
  rightAdornment?: string;
  leftAdornment?: string;
  textClickOutsideId?: string;
};

type TextInputWithAutoGrowWrapperProps = TextInputComponentProps;

const TextInputComponent = forwardRef<
  HTMLInputElement,
  TextInputComponentProps
>(
  (
    {
      className,
      label,
      value,
      onChange,
      onFocus,
      onBlur,
      onKeyDown,
      fullWidth,
      width,
      error,
      noErrorHelper = false,
      required,
      type,
      autoFocus,
      placeholder,
      disabled,
      readOnly,
      tabIndex,
      RightIcon,
      onRightIconClick,
      LeftIcon,
      autoComplete,
      maxLength,
      sizeVariant = 'lg',
      inheritFontStyles = false,
      dataTestId,
      autoGrow = false,
      rightAdornment,
      leftAdornment,
      textClickOutsideId,
    },
    ref,
  ) => {
    const theme = useTheme();
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, inputRef);

    const [passwordVisible, setPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleTogglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible);
    };

    const handleFocus: FocusEventHandler<HTMLInputElement> = (event) => {
      setIsFocused(true);
      onFocus?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLInputElement> = (event) => {
      setIsFocused(false);
      onBlur?.(event);
    };

    const instanceId = useId();

    return (
      <StyledContainer
        className={className}
        fullWidth={fullWidth ?? false}
        data-click-outside-id={textClickOutsideId}
      >
        {label && (
          <InputLabel htmlFor={instanceId}>
            {label + (required ? '*' : '')}
          </InputLabel>
        )}
        <StyledInputContainer>
          {leftAdornment && (
            <StyledAdornmentContainer sizeVariant={sizeVariant} position="left">
              {leftAdornment}
            </StyledAdornmentContainer>
          )}

          {!!LeftIcon && (
            <StyledLeftIconContainer sizeVariant={sizeVariant}>
              <StyledTrailingIcon isFocused={isFocused}>
                <LeftIcon size={theme.icon.size.md} />
              </StyledTrailingIcon>
            </StyledLeftIconContainer>
          )}

          <StyledInput
            id={instanceId}
            width={width}
            data-testid={dataTestId}
            autoComplete={autoComplete || 'off'}
            ref={combinedRef}
            tabIndex={tabIndex ?? 0}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
              readOnly,
              placeholder,
              required,
              value,
              LeftIcon,
              RightIcon,
              maxLength,
              error,
              sizeVariant,
              inheritFontStyles,
              autoGrow,
              leftAdornment,
              rightAdornment,
            }}
          />
          {rightAdornment && (
            <StyledAdornmentContainer
              sizeVariant={sizeVariant}
              position="right"
            >
              {rightAdornment}
            </StyledAdornmentContainer>
          )}
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
              <StyledTrailingIcon
                onClick={onRightIconClick ? onRightIconClick : undefined}
              >
                <RightIcon size={theme.icon.size.md} />
              </StyledTrailingIcon>
            )}
          </StyledTrailingIconContainer>
        </StyledInputContainer>
        {!noErrorHelper && error && (
          <InputErrorHelper>{error}</InputErrorHelper>
        )}
      </StyledContainer>
    );
  },
);

const StyledAutogrowWrapper = styled(AutogrowWrapper)<{
  sizeVariant?: TextInputSize;
}>`
  box-sizing: border-box;
  height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};
  padding: 0 ${({ theme }) => theme.spacing(1.25)};
`;

const TextInputWithAutoGrowWrapper = forwardRef<
  HTMLInputElement,
  TextInputWithAutoGrowWrapperProps
>((props, ref) => {
  return (
    <>
      {props.autoGrow ? (
        <StyledAutogrowWrapper
          sizeVariant={props.sizeVariant}
          node={props.value || props.placeholder}
        >
          <TextInputComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            fullWidth={true}
          />
        </StyledAutogrowWrapper>
      ) : (
        <TextInputComponent
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...props}
          ref={ref}
        />
      )}
    </>
  );
});

export const TextInput = TextInputWithAutoGrowWrapper;
