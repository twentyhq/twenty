import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { styled } from '@linaria/react';
import { type FocusEvent, type Ref } from 'react';
import { Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledInputContent = styled.div<{ isInRow: boolean }>`
  align-items: center;
  align-self: stretch;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-width: 0;
  padding-inline-start: ${({ isInRow }) =>
    isInRow ? themeCssVariables.spacing[1] : themeCssVariables.spacing[2]};
`;

type MultiItemFieldTextInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  hasError?: boolean;
  isInRow?: boolean;
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: () => void;
  onShiftTab?: () => void;
  shouldPreventTabNavigation?: boolean;
  onFocus?: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent<HTMLInputElement>) => void;
  ref?: Ref<HTMLInputElement>;
};

export const MultiItemFieldTextInput = ({
  value,
  onChange,
  placeholder,
  autoFocus,
  hasError = false,
  isInRow = false,
  onEnter,
  onEscape,
  onTab,
  onShiftTab,
  shouldPreventTabNavigation,
  onFocus,
  onBlur,
  ref,
}: MultiItemFieldTextInputProps) => (
  <StyledInputContent isInRow={isInRow}>
    <Input
      variant="plain"
      hasFocusRing={false}
      aria-invalid={hasError || undefined}
      autoFocus={autoFocus}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      ref={ref}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={getMultiItemInputKeyDownHandler({
        onEnter,
        onEscape,
        onTab,
        onShiftTab,
        shouldPreventTabNavigation,
      })}
    />
  </StyledInputContent>
);
