import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';

export const ViewBarDetailsAddFilterButton = () => {
  const { toggleDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);

  const { resetFilterDropdown } = useResetFilterDropdown(
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const handleClick = () => {
    resetFilterDropdown();
    toggleDropdown();
  };

  return (
    <LightButton
      onClick={handleClick}
      Icon={IconPlus}
      title={t`Add filter`}
      accent="tertiary"
    />
  );
};
