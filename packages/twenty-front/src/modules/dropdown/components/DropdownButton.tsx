import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ReactNode } from 'react';

export const DropdownButton = ({
  dropdownId,
  value,
}: {
  dropdownId: string;
  value: string | ReactNode;
}) => {
  const { isDropdownOpen, toggleDropdown } = useDropdown(dropdownId);

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={toggleDropdown}
    >
      {value}
    </StyledHeaderDropdownButton>
  );
};
