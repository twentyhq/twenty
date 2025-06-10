import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef, InputHTMLAttributes, ReactNode, useRef } from 'react';

import { useRegisterInputEvents } from '@/object-record/record-field/meta-types/input/hooks/useRegisterInputEvents';
import { useCombinedRefs } from '~/hooks/useCombinedRefs';
import { TEXT_INPUT_STYLE } from 'twenty-ui/theme';

const StyledInput = styled.input<{
  withRightComponent?: boolean;
  hasError?: boolean;
  hasItem: boolean;
}>`
  ${TEXT_INPUT_STYLE}

  ${({ hasItem, theme }) =>
    hasItem &&
    css`
      background-color: ${theme.background.transparent.lighter};
      border-radius: 4px;
      border: 1px solid ${theme.border.color.medium};
    `}
  
  ${({ hasError, hasItem, theme }) =>
    hasError &&
    hasItem &&
    css`
      border: 1px solid ${theme.border.color.danger};
    `}

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

export type MultiItemBaseInputProps = Omit<HTMLInputProps, 'onChange'> & {
  hotkeyScope?: string;
  onClickOutside?: () => void;
  onEnter?: () => void;
  onEscape?: () => void;
  onShiftTab?: () => void;
  onTab?: () => void;
  rightComponent?: ReactNode;
  renderInput?: (props: {
    value: HTMLInputProps['value'];
    onChange: (value: string) => void;
    autoFocus: HTMLInputProps['autoFocus'];
    placeholder: HTMLInputProps['placeholder'];
  }) => React.ReactNode;
  error?: string | null;
  hasError?: boolean;
  hasItem: boolean;
  onChange: (value: string) => void;
};

export const MultiItemBaseInput = forwardRef<
  HTMLInputElement,
  MultiItemBaseInputProps
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
      hasItem,
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
              onChange={(event) => onChange(event.target.value)}
              ref={combinedRef}
              withRightComponent={!!rightComponent}
              hasItem={hasItem}
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
