import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useInputFocusWithoutScrollOnMount } from '@/ui/input/hooks/useInputFocusWithoutScrollOnMount';
import { styled } from '@linaria/react';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDropdownMenuSearchInputContainer = styled.div`
  --vertical-padding: ${themeCssVariables.spacing[2]};
  align-items: center;
  display: flex;
  flex-direction: row;
  min-height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: 100%;
`;

const StyledInput = styled.input`
  background-color: transparent;
  background-color: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  font-size: inherit;
  font-weight: inherit;

  &::placeholder,
  &::-webkit-input-placeholder {
    color: ${themeCssVariables.font.color.light};
    font-family: ${themeCssVariables.font.family};
    font-weight: ${themeCssVariables.font.weight.medium};
  }

  outline: none;
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[2]};
  width: 100%;

  &[type='number']::-webkit-outer-spin-button,
  &[type='number']::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

const defaultSearchPlaceholder = msg`Search`;

export const DropdownMenuSearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ value, onChange, placeholder, type }, forwardedRef) => {
  const { i18n } = useLingui();
  const { inputRef } = useInputFocusWithoutScrollOnMount();
  const ref = forwardedRef ?? inputRef;
  const translatedPlaceholder = placeholder ?? i18n._(defaultSearchPlaceholder);
  return (
    <StyledDropdownMenuSearchInputContainer>
      <StyledInput
        autoComplete="off"
        {...{ onChange, placeholder: translatedPlaceholder, type, value }}
        ref={ref}
      />
    </StyledDropdownMenuSearchInputContainer>
  );
});
