import { TableOptionsDropdownId } from '@/ui/data-table/constants/TableOptionsDropdownId';
import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useViewBarDropdownButton } from '@/ui/view-bar/hooks/useViewBarDropdownButton';

export const TableOptionsDropdownButton = () => {
  const { isDropdownOpen, toggleDropdown } = useViewBarDropdownButton({
    dropdownId: TableOptionsDropdownId,
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
