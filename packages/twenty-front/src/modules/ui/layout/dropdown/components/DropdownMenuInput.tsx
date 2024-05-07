import { forwardRef, InputHTMLAttributes, ReactNode, useRef } from 'react';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { RGBA } from '@/ui/theme/constants/Rgba';
import { TEXT_INPUT_STYLE } from '@/ui/theme/constants/TextInputStyle';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';

const StyledInput = styled.input<{ withRightComponent?: boolean }>`
  ${TEXT_INPUT_STYLE}

  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 32px;
  position: relative;
  width: 100%;

  &:focus {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0px 0px 0px 3px ${({ theme }) => RGBA(theme.color.blue, 0.1)};
  }

  ${({ withRightComponent }) =>
    withRightComponent &&
    css`
      padding-right: 32px;
    `}
`;

const StyledInputContainer = styled.div`
  box-sizing: border-box;
  padding: ${({ theme }) => theme.spacing(1)};
  position: relative;
  width: 100%;
`;

const StyledRightContainer = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: 50%;
  transform: translateY(-50%);
`;

type DropdownMenuInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hotkeyScope?: string;
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onShiftTab?: () => void;
  onTab?: () => void;
  rightComponent?: ReactNode;
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
      <StyledInputContainer className={className}>
        <StyledInput
          autoFocus={autoFocus}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          ref={combinedRef}
          withRightComponent={!!rightComponent}
        />
        {!!rightComponent && (
          <StyledRightContainer>{rightComponent}</StyledRightContainer>
        )}
      </StyledInputContainer>
    );
  },
);
