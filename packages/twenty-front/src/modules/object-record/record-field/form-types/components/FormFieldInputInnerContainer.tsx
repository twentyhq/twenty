import { FormFieldInputHotKeyScope } from '@/object-record/record-field/form-types/constants/FormFieldInputHotKeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef, HTMLAttributes, Ref } from 'react';

type FormFieldInputInnerContainerProps = {
  hasRightElement: boolean;
  multiline?: boolean;
  readonly?: boolean;
  preventSetHotkeyScope?: boolean;
};

const StyledFormFieldInputInnerContainer = styled.div<FormFieldInputInnerContainerProps>`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-top-left-radius: ${({ theme }) => theme.border.radius.sm};
  border-bottom-left-radius: ${({ theme }) => theme.border.radius.sm};

  ${({ multiline, hasRightElement, theme }) =>
    multiline || !hasRightElement
      ? css`
          border-right: auto;
          border-bottom-right-radius: ${theme.border.radius.sm};
          border-top-right-radius: ${theme.border.radius.sm};
        `
      : css`
          border-right: none;
          border-bottom-right-radius: none;
          border-top-right-radius: none;
        `}

  box-sizing: border-box;
  display: flex;
  overflow: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  width: 100%;
`;

export const FormFieldInputInnerContainer = forwardRef(
  (
    {
      className,
      children,
      onFocus,
      onBlur,
      hasRightElement,
      multiline,
      readonly,
      preventSetHotkeyScope = false,
      onClick,
    }: HTMLAttributes<HTMLDivElement> & FormFieldInputInnerContainerProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const {
      goBackToPreviousHotkeyScope,
      setHotkeyScopeAndMemorizePreviousScope,
    } = usePreviousHotkeyScope();

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);

      if (!preventSetHotkeyScope) {
        setHotkeyScopeAndMemorizePreviousScope(
          FormFieldInputHotKeyScope.FormFieldInput,
        );
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(e);

      if (!preventSetHotkeyScope) {
        goBackToPreviousHotkeyScope();
      }
    };

    return (
      <StyledFormFieldInputInnerContainer
        ref={ref}
        className={className}
        hasRightElement={hasRightElement}
        multiline={multiline}
        readonly={readonly}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={onClick}
      >
        {children}
      </StyledFormFieldInputInnerContainer>
    );
  },
);
