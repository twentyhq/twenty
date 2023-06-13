import { InputHTMLAttributes } from 'react';
import styled from '@emotion/styled';

import { textInputStyle } from '@/ui/layout/styles/themes';

export const DropdownMenuSearchContainer = styled.div`
  --horizontal-padding: ${(props) => props.theme.spacing(2)};
  --vertical-padding: ${(props) => props.theme.spacing(1)};

  width: calc(100% - 2 * var(--horizontal-padding));
  height: calc(36px - 2 * var(--vertical-padding));

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: var(--vertical-padding) var(--horizontal-padding);

  border-bottom: 1px solid ${(props) => props.theme.lightBorder};
`;

const StyledEditModeSearchInput = styled.input`
  width: 100%;

  ${textInputStyle}

  font-size: ${(props) => props.theme.fontSizeSmall};
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
