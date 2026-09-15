import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { styled } from '@linaria/react';
import { forwardRef, type HTMLAttributes, type Ref } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type FormFieldInputInnerContainerProps = {
  hasRightElement: boolean;
  hoverable?: boolean;
  multiline?: boolean;
  readonly?: boolean;
  preventFocusStackUpdate?: boolean;
  formFieldInputInstanceId: string;
  variant?: FormFieldInputVariant;
};

const StyledFormFieldInputInnerContainer = styled.div<
  Omit<FormFieldInputInnerContainerProps, 'formFieldInputInstanceId'> & {
    $variant: FormFieldInputVariant;
  }
>`
  align-items: ${({ multiline }) => (multiline ? 'flex-start' : 'center')};
  background-color: ${({ $variant }) =>
    $variant === 'transparent'
      ? 'transparent'
      : themeCssVariables.background.transparent.lighter};
  border: ${({ $variant }) =>
    $variant === 'transparent'
      ? 'none'
      : `1px solid ${themeCssVariables.border.color.medium}`};
  border-bottom-left-radius: ${({ $variant }) =>
    $variant === 'transparent' ? '0' : themeCssVariables.border.radius.md};
  border-bottom-right-radius: ${({ multiline, hasRightElement, $variant }) =>
    $variant === 'transparent'
      ? '0'
      : multiline || !hasRightElement
        ? themeCssVariables.border.radius.md
        : '0'};
  border-right: ${({ multiline, hasRightElement, $variant }) =>
    $variant === 'transparent'
      ? 'none'
      : multiline || !hasRightElement
        ? `1px solid ${themeCssVariables.border.color.medium}`
        : 'none'};
  border-top-left-radius: ${({ $variant }) =>
    $variant === 'transparent' ? '0' : themeCssVariables.border.radius.md};
  border-top-right-radius: ${({ multiline, hasRightElement, $variant }) =>
    $variant === 'transparent'
      ? '0'
      : multiline || !hasRightElement
        ? themeCssVariables.border.radius.md
        : '0'};
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  overflow-y: ${({ multiline }) => (multiline ? 'auto' : 'hidden')};
  scrollbar-width: none;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }

  &:hover,
  &[data-open='true'] {
    background-color: ${({ hoverable, $variant }) =>
      $variant === 'transparent'
        ? 'transparent'
        : hoverable
          ? themeCssVariables.background.transparent.light
          : themeCssVariables.background.transparent.lighter};
  }
`;

export const FormFieldInputInnerContainer = forwardRef(
  (
    {
      className,
      children,
      onFocus,
      onBlur,
      hasRightElement,
      hoverable,
      multiline,
      readonly,
      preventFocusStackUpdate = false,
      onClick,
      formFieldInputInstanceId,
      variant = 'default',
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
        hoverable={hoverable}
        multiline={multiline}
        readonly={readonly}
        $variant={variant}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={onClick}
      >
        {children}
      </StyledFormFieldInputInnerContainer>
    );
  },
);
