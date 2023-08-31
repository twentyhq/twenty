import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';

import { BoardOptionsDropdownKey } from '../types/BoardOptionsDropdownKey';

export function BoardOptionsDropdownButton() {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    key: BoardOptionsDropdownKey,
  });

  function handleClick() {
    toggleDropdownButton();
  }

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownButtonOpen}
      onClick={handleClick}
    >
      Options
    </StyledHeaderDropdownButton>
  );
}
