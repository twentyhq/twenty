import { InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/themes/effects';

export const DropdownMenuSearchContainer = styled.div`
  --vertical-padding: ${({ theme }) => theme.spacing(1)};

  align-items: center;

  display: flex;
  flex-direction: row;
  height: calc(36px - 2 * var(--vertical-padding));
  padding: var(--vertical-padding) 0;

  width: calc(100%);
`;

const StyledEditModeSearchInput = styled.input`
  font-size: ${({ theme }) => theme.font.size.sm};

  ${textInputStyle}

  width: 100%;
`;

export function DropdownMenuSearch(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <DropdownMenuSearchContainer>
      <StyledEditModeSearchInput
        {...props}
        placeholder={props.placeholder ?? 'Search'}
      />
    </DropdownMenuSearchContainer>
  );
}
