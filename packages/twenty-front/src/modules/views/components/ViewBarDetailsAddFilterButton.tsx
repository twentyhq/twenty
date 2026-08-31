import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/icon';
import { LightButton } from 'twenty-ui/input';

export const ViewBarDetailsAddFilterButton = () => {
  const { mainDropdownId } = useViewBarFilterDropdownIds();

  const { toggleDropdown } = useToggleDropdown();

  const { resetFilterDropdown } = useResetFilterDropdown(mainDropdownId);

  const handleClick = () => {
    resetFilterDropdown();
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: mainDropdownId,
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
