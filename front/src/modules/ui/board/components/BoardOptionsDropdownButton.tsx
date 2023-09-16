import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';

import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

export const BoardOptionsDropdownButton = () => {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    dropdownId: BoardOptionsDropdownKey,
  });

  const handleClick = () => {
    toggleDropdownButton();
  };

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownButtonOpen}
      onClick={handleClick}
    >
      Options
    </StyledHeaderDropdownButton>
  );
};
