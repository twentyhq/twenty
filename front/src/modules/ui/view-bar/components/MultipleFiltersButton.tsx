import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';

import { FilterDropdownId } from '../constants/FilterDropdownId';

export function MultipleFiltersButton() {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    dropdownId: FilterDropdownId,
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
