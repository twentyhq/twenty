import { StyledHeaderDropdownButton } from '@/ui/dropdown/components/StyledHeaderDropdownButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';

import { TableOptionsDropdownKey } from '../../types/TableOptionsDropdownKey';

export function TableOptionsDropdownButton() {
  const { isDropdownButtonOpen, toggleDropdownButton } = useDropdownButton({
    key: TableOptionsDropdownKey,
  });

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownButtonOpen}
      onClick={toggleDropdownButton}
    >
      Options
    </StyledHeaderDropdownButton>
  );
}
