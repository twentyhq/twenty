import { TableOptionsDropdownId } from '@/ui/data-table/constants/TableOptionsDropdownId';
import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';

export const TableOptionsDropdownButton = () => {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    dropdownId: TableOptionsDropdownId,
  });

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownButtonOpen}
      onClick={toggleDropdownButton}
    >
      Options
    </StyledHeaderDropdownButton>
  );
};
