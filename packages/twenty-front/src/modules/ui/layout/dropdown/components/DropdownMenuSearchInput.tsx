import { useInputFocusWithoutScrollOnMount } from '@/ui/input/hooks/useInputFocusWithoutScrollOnMount';
import styled from '@emotion/styled';
import { forwardRef, InputHTMLAttributes } from 'react';
import { TEXT_INPUT_STYLE } from 'twenty-ui';

const StyledDropdownMenuSearchInputContainer = styled.div`
  align-items: center;
  --vertical-padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: row;
  min-height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: 100%;
`;

const StyledInput = styled.input`
  ${TEXT_INPUT_STYLE}

  font-size: ${({ theme }) => theme.font.size.sm};
  background-color: transparent;
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

export const DropdownMenuSearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ value, onChange, placeholder = 'Search', type }, forwardedRef) => {
  const { inputRef } = useInputFocusWithoutScrollOnMount();
  const ref = forwardedRef ?? inputRef;
  return (
    <StyledDropdownMenuSearchInputContainer>
      <StyledInput
        autoComplete="off"
        {...{ onChange, placeholder, type, value }}
        ref={ref}
      />
    </StyledDropdownMenuSearchInputContainer>
  );
});
