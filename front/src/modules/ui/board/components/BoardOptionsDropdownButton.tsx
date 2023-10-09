import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';

import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

export const BoardOptionsDropdownButton = () => {
  const { isDropdownOpen, toggleDropdown } = useDropdown({
    dropdownId: BoardOptionsDropdownKey,
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
