import { TableOptionsDropdownId } from '@/object-record/record-table/constants/TableOptionsDropdownId';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const TableOptionsDropdownButton = () => {
  const { isDropdownOpen, toggleDropdown } = useDropdown(
    TableOptionsDropdownId,
  );

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={toggleDropdown}
    >
      Options
    </StyledHeaderDropdownButton>
  );
};
