import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';

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
