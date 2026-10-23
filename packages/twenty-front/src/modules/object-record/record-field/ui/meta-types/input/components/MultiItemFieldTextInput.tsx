import { getMultiItemInputKeyDownHandler } from '@/object-record/record-field/ui/meta-types/input/utils/getMultiItemInputKeyDownHandler';
import { styled } from '@linaria/react';
import { type FocusEvent, type Ref } from 'react';
import { Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledInputContent = styled.div`
  align-items: center;
  align-self: stretch;
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-width: 0;
  padding-inline-start: ${themeCssVariables.spacing[2]};

  &[data-in-row='true'] {
    padding-inline-start: ${themeCssVariables.spacing[1]};
  }

  &[data-in-row='true'][data-has-error='true'] {
    color: ${themeCssVariables.color.red};
  }
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
  <StyledInputContent data-in-row={isInRow} data-has-error={hasError}>
    <Input
      variant="plain"
      hasFocusRing={false}
      aria-invalid={(hasError && !isInRow) || undefined}
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
