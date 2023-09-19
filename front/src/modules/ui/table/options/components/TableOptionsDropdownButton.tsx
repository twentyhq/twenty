import { useRecoilState } from 'recoil';

import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { TableOptionsDropdownId } from '@/ui/table/constants/TableOptionsDropdownId';
import { isDraggingAndSelectingState } from '@/ui/table/states/isDraggingAndSelectingState';

export const TableOptionsDropdownButton = () => {
  const [, setIsDraggingAndSelecting] = useRecoilState(
    isDraggingAndSelectingState,
  );
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    dropdownId: TableOptionsDropdownId,
  });

  const toggleDropdown = () => {
    setIsDraggingAndSelecting(false);
    toggleDropdownButton();
  };

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownButtonOpen}
      onClick={toggleDropdown}
    >
      Options
    </StyledHeaderDropdownButton>
  );
};
