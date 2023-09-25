import { forwardRef, InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/theme/constants/effects';

const StyledDropdownMenuSearchInputContainer = styled.div`
  --vertical-padding: ${({ theme }) => theme.spacing(1)};

  align-items: center;

  display: flex;
  flex-direction: row;
  height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: 100%;
`;

const StyledInput = styled.input`
  ${textInputStyle}

  font-size: ${({ theme }) => theme.font.size.sm};
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
>((props, ref) => (
  <StyledDropdownMenuSearchInputContainer>
    <StyledInput
      autoFocus
      autoComplete="off"
      placeholder="Search"
      {...props}
      ref={ref}
    />
  </StyledDropdownMenuSearchInputContainer>
));
