import styled from '@emotion/styled';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownScope } from '@/ui/layout/dropdown/scopes/DropdownScope';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { FilterDropdownId } from '../constants/FilterDropdownId';

import { MultipleFiltersButton } from './MultipleFiltersButton';
import { MultipleFiltersDropdownContent } from './MultipleFiltersDropdownContent';

type MultipleFiltersDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
  isInViewBar?: boolean;
  customDropDownId?: string;
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
    <DropdownScope dropdownScopeId={FilterDropdownId}>
      <StyledDropdownContainer isInViewBar={isInViewBar}>
        <Dropdown
          // dropdownId={
          //   isInViewBar ? (customDropDownId as string) : FilterDropdownId
          // }
          clickableComponent={isInViewBar ? <></> : <MultipleFiltersButton />}
          dropdownComponents={<MultipleFiltersDropdownContent />}
          dropdownHotkeyScope={hotkeyScope}
          dropdownOffset={{ y: 8 }}
        />
      </StyledDropdownContainer>
    </DropdownScope>
  );
};
