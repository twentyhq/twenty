import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useViewBarDropdownButton } from '@/ui/view-bar/hooks/useViewBarDropdownButton';

import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

export const BoardOptionsDropdownButton = () => {
  const { isDropdownOpen, toggleDropdown } = useViewBarDropdownButton({
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
