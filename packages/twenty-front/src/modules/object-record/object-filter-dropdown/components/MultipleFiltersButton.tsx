import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import useI18n from '@/ui/i18n/useI18n';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';

export const MultipleFiltersButton = () => {
  const { resetFilter } = useFilterDropdown();
  const { translate } = useI18n('translations');
  const { isDropdownOpen, toggleDropdown } = useDropdown(ObjectFilterDropdownId);

  const handleClick = () => {
    toggleDropdown();
    resetFilter();
  };

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={handleClick}
    >
      {translate('filter')}
    </StyledHeaderDropdownButton>
  );
};
