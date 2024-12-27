import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef, InputHTMLAttributes, ReactNode, useRef } from 'react';
import 'react-phone-number-input/style.css';
import { TEXT_INPUT_STYLE } from 'twenty-ui';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';

const StyledInput = styled.input<{
  withRightComponent?: boolean;
  hasError?: boolean;
}>`
  ${TEXT_INPUT_STYLE}

  box-sizing: border-box;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 32px;
  position: relative;
  width: 100%;

  ${({ withRightComponent }) =>
    withRightComponent &&
    css`
      padding-right: 32px;
    `}
`;

const StyledInputContainer = styled.div`
  background-color: transparent;
  box-sizing: border-box;
  position: relative;
  width: 100%;

  &:not(:first-of-type) {
    padding: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledRightContainer = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: 50%;
  transform: translateY(-50%);
`;

const StyledErrorDiv = styled.div`
  color: ${({ theme }) => theme.color.red};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

type HTMLInputProps = InputHTMLAttributes<HTMLInputElement>;

export type DropdownMenuInputProps = HTMLInputProps & {
  hotkeyScope?: string;
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onShiftTab?: () => void;
  onTab?: () => void;
  rightComponent?: ReactNode;
  renderInput?: (props: {
    value: HTMLInputProps['value'];
    onChange: HTMLInputProps['onChange'];
    autoFocus: HTMLInputProps['autoFocus'];
    placeholder: HTMLInputProps['placeholder'];
  }) => React.ReactNode;
  error?: string | null;
  hasError?: boolean;
};

export const DropdownMenuInput = forwardRef<
  HTMLInputElement,
  DropdownMenuInputProps
>(
  (
    {
      autoFocus,
      className,
      value,
      placeholder,
      hotkeyScope = 'dropdown-menu-input',
      onChange,
      onClickOutside,
      onEnter = () => {},
      onEscape = () => {},
      onShiftTab,
      onTab,
      rightComponent,
      renderInput,
      error = '',
      hasError = false,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = useCombinedRefs(ref, inputRef);

    useRegisterInputEvents({
      inputRef,
      inputValue: value,
      onEnter,
      onEscape,
      onClickOutside,
      onTab,
      onShiftTab,
      hotkeyScope,
    });

    return (
      <>
        <StyledInputContainer className={className}>
          {renderInput ? (
            renderInput({
              value,
              onChange,
              autoFocus,
              placeholder,
            })
          ) : (
            <StyledInput
              hasError={hasError}
              autoFocus={autoFocus}
              value={value}
              placeholder={placeholder}
              onChange={onChange}
              ref={combinedRef}
              withRightComponent={!!rightComponent}
            />
          )}
          {!!rightComponent && (
            <StyledRightContainer>{rightComponent}</StyledRightContainer>
          )}
        </StyledInputContainer>
        {error && <StyledErrorDiv>{error}</StyledErrorDiv>}
      </>
    );
  },
);
