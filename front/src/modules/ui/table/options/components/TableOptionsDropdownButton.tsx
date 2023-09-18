import { useRecoilState } from 'recoil';

import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { TableOptionsDropdownId } from '@/ui/table/constants/TableOptionsDropdownId';
import { dragSelectState } from '@/ui/table/states/dragSelectState';

export const TableOptionsDropdownButton = () => {
  const [, setDragSelect] = useRecoilState(dragSelectState);
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    dropdownId: TableOptionsDropdownId,
  });

  const toggleDropdown = () => {
    setDragSelect(false);
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
