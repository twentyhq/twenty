import styled from '@emotion/styled';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { FilterDropdownId } from '../constants/FilterDropdownId';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';
import { ViewBarDropdownButton } from './ViewBarDropdownButton';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
  isInViewBar?: boolean;
};

const StyledDropdownContainer = styled.div<{ isInViewBar?: boolean }>`
  ${({ isInViewBar }) =>
    isInViewBar &&
    `
      left: 0px;
      position: absolute;
      top: 32px;
      z-index: 1;
      background-color: white;
    `}
`;

export const MultipleFiltersDropdownButton = ({
  hotkeyScope,
  isInViewBar,
}: MultipleFiltersDropdownButtonProps) => {
  return (
    <StyledDropdownContainer isInViewBar={isInViewBar}>
      <ViewBarDropdownButton
        dropdownId={isInViewBar ? hotkeyScope.scope : FilterDropdownId}
        buttonComponent={isInViewBar ? <></> : <MultipleFiltersButton />}
        dropdownComponents={
          <MultipleFiltersDropdownContent hotkeyScope={hotkeyScope} />
        }
        dropdownHotkeyScope={hotkeyScope}
      />
    </StyledDropdownContainer>
  );
};
