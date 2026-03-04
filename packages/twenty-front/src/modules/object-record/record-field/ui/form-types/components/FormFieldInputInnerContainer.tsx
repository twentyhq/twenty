import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { styled } from '@linaria/react';
import { forwardRef, type HTMLAttributes, type Ref } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-top-left-radius: ${themeCssVariables.border.radius.sm};
  border-bottom-left-radius: ${themeCssVariables.border.radius.sm};

  border-bottom-right-radius: ${({ multiline, hasRightElement }) =>
    multiline || !hasRightElement ? themeCssVariables.border.radius.sm : '0'};
  border-right: ${({ multiline, hasRightElement }) =>
    multiline || !hasRightElement ? 'auto' : 'none'};
  border-top-right-radius: ${({ multiline, hasRightElement }) =>
    multiline || !hasRightElement ? themeCssVariables.border.radius.sm : '0'};
  box-sizing: border-box;
  display: flex;
  overflow-x: auto;
  overflow-y: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
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
