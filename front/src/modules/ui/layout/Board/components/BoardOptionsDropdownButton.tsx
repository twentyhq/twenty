import { StyledHeaderDropdownButton } from '@/ui/Layout/Dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/Layout/Dropdown/hooks/useDropdown';

import { BoardScopeIds } from '../types/enums/BoardScopeIds';

export const BoardOptionsDropdownButton = () => {
  const { isDropdownOpen, toggleDropdown } = useDropdown({
    dropdownScopeId: BoardScopeIds.OptionsDropdown,
  });

  const handleClick = () => {
    toggleDropdown();
  };

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={handleClick}
    >
      Options
    </StyledHeaderDropdownButton>
  );
};
