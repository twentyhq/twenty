import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';
import { LightButton } from 'twenty-ui/input';

export const ViewBarDetailsAddFilterButton = () => {
  const { toggleDropdown } = useToggleDropdown();

  const { resetFilterDropdown } = useResetFilterDropdown(
    ViewBarFilterDropdownIds.MAIN,
  );

  const handleClick = () => {
    resetFilterDropdown();
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: ViewBarFilterDropdownIds.MAIN,
    });
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
