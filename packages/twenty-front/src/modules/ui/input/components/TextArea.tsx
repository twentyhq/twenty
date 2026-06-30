import { styled } from '@linaria/react';
import { type FocusEventHandler, useId } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isDefined } from 'twenty-shared/utils';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type TextAreaVariant = 'default' | 'transparent';

export type TextAreaProps = {
  textAreaId: string;
  label?: string;
  disabled?: boolean;
  height?: number;
  minRows?: number;
  maxRows?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  readOnly?: boolean;
  variant?: TextAreaVariant;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledLabel = styled.label`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledTextAreaContainer = styled.div<{ variant: TextAreaVariant }>`
  > textarea {
    background-color: ${({ variant }) =>
      variant === 'transparent'
        ? 'transparent'
        : themeCssVariables.background.transparent.lighter};
    border: ${({ variant }) =>
      variant === 'transparent'
        ? 'none'
        : `1px solid ${themeCssVariables.border.color.medium}`};
    border-radius: ${({ variant }) =>
      variant === 'transparent' ? '0' : themeCssVariables.border.radius.sm};
    box-sizing: border-box;
    color: ${themeCssVariables.font.color.primary};
    display: block;
    font-family: inherit;
    font-size: ${themeCssVariables.font.size.md};
    font-weight: ${themeCssVariables.font.weight.regular};
    line-height: ${({ variant }) =>
      variant === 'transparent' ? 'inherit' : '16px'};
    overflow: ${({ variant }) =>
      variant === 'transparent' ? 'hidden' : 'auto'};
    padding: ${({ variant }) =>
      variant === 'transparent' ? '0' : themeCssVariables.spacing[2]};
    resize: none;
    width: 100%;

    &:focus {
      outline: none;
      box-shadow: ${({ variant }) =>
        variant === 'transparent'
          ? 'none'
          : `0px 0px 0px 3px ${themeCssVariables.color.transparent.blue2}`};
      border-color: ${({ variant }) =>
        variant === 'transparent'
          ? 'transparent'
          : themeCssVariables.color.blue};
    }

    &::placeholder {
      color: ${themeCssVariables.font.color.light};
      font-weight: ${themeCssVariables.font.weight.regular};
    }

    &:disabled {
      color: ${themeCssVariables.font.color.tertiary};
    }
  }
`;

export const TextArea = ({
  textAreaId,
  label,
  disabled,
  height,
  placeholder,
  minRows = 1,
  maxRows,
  value = '',
  className,
  onChange,
  onFocus,
  onBlur,
  readOnly = false,
  variant = 'default',
}: TextAreaProps) => {
  const computedMinRows = isDefined(maxRows)
    ? Math.min(minRows, maxRows)
    : minRows;

  const instanceId = useId();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const handleFocus: FocusEventHandler<HTMLTextAreaElement> = () => {
    pushFocusItemToFocusStack({
      focusId: textAreaId,
      component: {
        type: FocusComponentType.TEXT_AREA,
        instanceId: textAreaId,
      },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    onFocus?.();
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    removeFocusItemFromFocusStackById({ focusId: textAreaId });
    onBlur?.();
  };

  return (
    <StyledContainer>
      {label && <StyledLabel htmlFor={instanceId}>{label}</StyledLabel>}

      <StyledTextAreaContainer variant={variant}>
        <TextareaAutosize
          id={instanceId}
          placeholder={placeholder}
          maxRows={maxRows}
          minRows={computedMinRows}
          value={value}
          onChange={(event) =>
            onChange?.(turnIntoEmptyStringIfWhitespacesOnly(event.target.value))
          }
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={className}
          readOnly={readOnly}
          style={isDefined(height) ? { height } : undefined}
        />
      </StyledTextAreaContainer>
    </StyledContainer>
  );
};
