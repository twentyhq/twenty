import { InputErrorHelper } from '@/ui/input/components/InputErrorHelper';
import { isDefined } from 'twenty-shared/utils';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import React, {
  forwardRef,
  type ChangeEvent,
  type FocusEventHandler,
  type InputHTMLAttributes,
  useContext,
  useId,
  useRef,
  useState,
} from 'react';
import { type IconComponent, IconEye, IconEyeOff } from 'twenty-ui/display';
import { AutogrowWrapper } from 'twenty-ui/utilities';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
const StyledContainer = styled.div<Pick<TextInputComponentProps, 'fullWidth'>>`
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  position: relative;
  width: ${({ fullWidth }) => (fullWidth ? `100%` : 'auto')};
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
  background-color: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left-style: ${({ position }) =>
    position === 'right' ? 'none' : 'solid'};
  border-radius: ${({ position }) =>
    position === 'left'
      ? `${themeCssVariables.border.radius.sm} 0 0 ${themeCssVariables.border.radius.sm}`
      : `0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0`};
  border-right-style: ${({ position }) =>
    position === 'left' ? 'none' : 'solid'};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};
  justify-content: center;
  line-height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};
  min-width: fit-content;

  padding: ${themeCssVariables.spacing[2]};
  width: auto;
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
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid
    ${({ error }) =>
      error
        ? themeCssVariables.border.color.danger
        : themeCssVariables.border.color.medium};

  border-radius: ${({ leftAdornment, rightAdornment }) =>
    leftAdornment
      ? `0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm} 0`
      : rightAdornment
        ? `${themeCssVariables.border.radius.sm} 0 0 ${themeCssVariables.border.radius.sm}`
        : themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-grow: 1;
  font-family: ${({ inheritFontStyles }) =>
    inheritFontStyles ? 'inherit' : themeCssVariables.font.family};
  font-size: ${({ inheritFontStyles }) =>
    inheritFontStyles ? 'inherit' : themeCssVariables.font.size.md};
  font-weight: ${({ inheritFontStyles }) =>
    inheritFontStyles ? 'inherit' : themeCssVariables.font.weight.regular};
  height: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? '20px'
      : sizeVariant === 'sm'
        ? '24px'
        : sizeVariant === 'md'
          ? '28px'
          : '32px'};
  max-width: ${({ autoGrow }) => (autoGrow ? '100%' : 'none')};
  outline: none;
  padding: ${({ sizeVariant, autoGrow }) =>
    autoGrow
      ? 0
      : sizeVariant === 'xs'
        ? `${themeCssVariables.spacing[2]} 0`
        : themeCssVariables.spacing[2]};
  padding-left: ${({ LeftIcon, autoGrow }) =>
    autoGrow
      ? themeCssVariables.spacing[1]
      : LeftIcon
        ? `calc(${themeCssVariables.spacing[3]} + 16px)`
        : themeCssVariables.spacing[2]};
  padding-right: ${({ RightIcon, autoGrow }) =>
    autoGrow
      ? themeCssVariables.spacing[1]
      : RightIcon
        ? `calc(${themeCssVariables.spacing[3]} + 16px)`
        : themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  width: ${({ width }) =>
    isDefined(width)
      ? `calc(${width}px + ${themeCssVariables.spacing[0.5]})`
      : '100%'};
  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  &:disabled {
    color: ${themeCssVariables.font.color.tertiary};
  }

  &[readonly] {
    pointer-events: none;
  }

  &:focus {
    ${({ error }) => {
      return `
      border-color: ${error ? themeCssVariables.border.color.danger : themeCssVariables.color.blue};
      `;
    }};
  }
`;

const StyledLeftIconContainer = styled.div<{ sizeVariant: TextInputSize }>`
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: center;
  margin: auto 0;
  padding-left: ${({ sizeVariant }) =>
    sizeVariant === 'xs'
      ? themeCssVariables.spacing[0.5]
      : sizeVariant === 'md' || sizeVariant === 'sm'
        ? themeCssVariables.spacing[1]
        : themeCssVariables.spacing[2]};
  position: absolute;
  top: 0;
`;

const StyledTrailingIconContainer = styled.div<
  Pick<TextInputComponentProps, 'error'>
>`
  align-items: center;
  bottom: 0;
  display: flex;
  justify-content: center;
  margin: auto 0;
  padding-right: ${themeCssVariables.spacing[2]};
  position: absolute;
  right: 0;
  top: 0;
`;

const StyledTrailingIcon = styled.div<{
  isFocused?: boolean;
  onClick?: () => void;
}>`
  align-items: center;
  color: ${({ isFocused }) =>
    isFocused
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.light};
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
    const { theme } = useContext(ThemeContext);
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
            autoComplete={autoComplete ?? 'off'}
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

const autogrowBaseStyle = css`
  box-sizing: border-box;
  padding: 0 5px;
`;

const autogrowHeightXs = css`
  height: 20px;
`;
const autogrowHeightSm = css`
  height: 24px;
`;
const autogrowHeightMd = css`
  height: 28px;
`;
const autogrowHeightLg = css`
  height: 32px;
`;

const AUTOGROW_HEIGHT_MAP: Record<TextInputSize, string> = {
  xs: autogrowHeightXs,
  sm: autogrowHeightSm,
  md: autogrowHeightMd,
  lg: autogrowHeightLg,
};

type StyledAutogrowWrapperProps = React.ComponentProps<
  typeof AutogrowWrapper
> & {
  sizeVariant?: TextInputSize;
};

const StyledAutogrowWrapper = ({
  sizeVariant = 'lg',
  className,
  children,
  node,
}: StyledAutogrowWrapperProps) => (
  <AutogrowWrapper
    children={children}
    node={node}
    className={`${autogrowBaseStyle} ${AUTOGROW_HEIGHT_MAP[sizeVariant]} ${className ?? ''}`}
  />
);

const TextInputWithAutoGrowWrapper = forwardRef<
  HTMLInputElement,
  TextInputWithAutoGrowWrapperProps
>((props, ref) => {
  return (
    <>
      {props.autoGrow ? (
        <StyledAutogrowWrapper
          sizeVariant={props.sizeVariant}
          node={props.value ?? props.placeholder}
        >
          <TextInputComponent
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
            fullWidth={true}
          />
        </StyledAutogrowWrapper>
      ) : (
        <TextInputComponent
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...props}
          ref={ref}
        />
      )}
    </>
  );
});

export const TextInput = TextInputWithAutoGrowWrapper;
