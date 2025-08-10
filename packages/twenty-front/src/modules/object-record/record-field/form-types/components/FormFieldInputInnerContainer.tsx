import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { forwardRef, type HTMLAttributes, type Ref } from 'react';

type FormFieldInputInnerContainerProps = {
  hasRightElement: boolean;
  multiline?: boolean;
  readonly?: boolean;
  preventFocusStackUpdate?: boolean;
  formFieldInputInstanceId: string;
};

const StyledFormFieldInputInnerContainer = styled.div<
  Omit<FormFieldInputInnerContainerProps, 'formFieldInputInstanceId'>
>`
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
          border-bottom-right-radius: 0;
          border-top-right-radius: 0;
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
      preventFocusStackUpdate = false,
      onClick,
      formFieldInputInstanceId,
    }: HTMLAttributes<HTMLDivElement> & FormFieldInputInnerContainerProps,
    ref: Ref<HTMLDivElement>,
  ) => {
    const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
    const { removeFocusItemFromFocusStackById } =
      useRemoveFocusItemFromFocusStackById();

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(e);

      if (!preventFocusStackUpdate) {
        pushFocusItemToFocusStack({
          focusId: formFieldInputInstanceId,
          component: {
            type: FocusComponentType.FORM_FIELD_INPUT,
            instanceId: formFieldInputInstanceId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(e);

      if (!preventFocusStackUpdate) {
        removeFocusItemFromFocusStackById({
          focusId: formFieldInputInstanceId,
        });
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
