import { IconPlus } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';

export const AddObjectFilterFromDetailsButton = () => {
  const { toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectFilterDropdownId,
  });

  const { resetFilter } = useFilter();

  const handleClick = () => {
    resetFilter();
    toggleDropdown();
  };

  return (
    <LightButton
      onClick={handleClick}
      icon={<IconPlus />}
      title="Add filter"
      accent="tertiary"
    />
  );
};
