import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { Trans } from '@lingui/react/macro';

export const ViewBarFilterButton = () => {
  const { resetFilterDropdown } = useResetFilterDropdown();

  const { toggleDropdown, isDropdownOpen } = useDropdown(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const handleClick = () => {
    toggleDropdown();
    resetFilterDropdown();
  };

  return (
    <StyledHeaderDropdownButton
      onClick={handleClick}
      isUnfolded={isDropdownOpen}
    >
      <Trans>Filter</Trans>
    </StyledHeaderDropdownButton>
  );
};
