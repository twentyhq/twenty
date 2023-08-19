import { forwardRef, InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/theme/constants/effects';

const StyledDropdownMenuInputContainer = styled.div`
  --vertical-padding: ${({ theme }) => theme.spacing(1)};

  align-items: center;

  display: flex;
  flex-direction: row;
  height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: calc(100%);
`;

const StyledInput = styled.input`
  font-size: ${({ theme }) => theme.font.size.sm};

  ${textInputStyle}

  width: 100%;
`;

export const DropdownMenuInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <StyledDropdownMenuInputContainer>
    <StyledInput autoComplete="off" placeholder="Search" {...props} ref={ref} />
  </StyledDropdownMenuInputContainer>
));
