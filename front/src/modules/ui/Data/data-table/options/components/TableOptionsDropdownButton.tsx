import { TableOptionsDropdownId } from '@/ui/Data/Data Table/constants/TableOptionsDropdownId';
import { StyledHeaderDropdownButton } from '@/ui/Layout/Dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/Layout/Dropdown/hooks/useDropdown';

export const TableOptionsDropdownButton = () => {
  const { isDropdownOpen, toggleDropdown } = useDropdown({
    dropdownScopeId: TableOptionsDropdownId,
  });

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={toggleDropdown}
    >
      Options
    </StyledHeaderDropdownButton>
  );
};
