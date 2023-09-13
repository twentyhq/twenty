import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';

import { FilterDropdownKey } from '../types/FilterDropdownKey';

export function MultipleFiltersButton() {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    key: FilterDropdownKey,
  });

  function handleClick() {
    toggleDropdownButton();
  }

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownButtonOpen}
      onClick={handleClick}
    >
      Filter
    </StyledHeaderDropdownButton>
  );
}
