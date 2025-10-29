import styled from '@emotion/styled';
import { type FocusEventHandler, useId } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { turnIntoEmptyStringIfWhitespacesOnly } from '~/utils/string/turnIntoEmptyStringIfWhitespacesOnly';

const MAX_ROWS = 5;

export type TextAreaProps = {
  textAreaId: string;
  label?: string;
  disabled?: boolean;
  minRows?: number;
  maxRows?: number;
  onChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
  className?: string;
  onBlur?: () => void;
  readOnly?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledLabel = styled.label`
  color: ${({ theme }) => theme.font.color.light};
  display: block;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledTextArea = styled(TextareaAutosize)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: inherit;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: 16px;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  resize: none;
  width: 100%;

  &:focus {
    outline: none;
    ${({ theme }) => {
      return `box-shadow: 0px 0px 0px 3px ${theme.color.transparent.blue2};
      border-color: ${theme.color.blue};`;
    }};
  }

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.regular};
  }

  &:disabled {
    color: ${({ theme }) => theme.font.color.tertiary};
  }
`;

export const TextArea = ({
  textAreaId,
  label,
  disabled,
  placeholder,
  minRows = 1,
  maxRows = MAX_ROWS,
  value = '',
  className,
  onChange,
  onBlur,
  readOnly = false,
}: TextAreaProps) => {
  const computedMinRows = Math.min(minRows, maxRows);

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
  };

  const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
    removeFocusItemFromFocusStackById({ focusId: textAreaId });
    onBlur?.();
  };

  return (
    <StyledContainer>
      {label && <StyledLabel htmlFor={instanceId}>{label}</StyledLabel>}

      <StyledTextArea
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
      />
    </StyledContainer>
  );
};
