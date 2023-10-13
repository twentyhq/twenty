import { IconPlus } from '@/ui/Display/Icon';
import { LightButton } from '@/ui/Input/Button/components/LightButton';
import { useDropdown } from '@/ui/Layout/Dropdown/hooks/useDropdown';

import { FilterDropdownId } from '../constants/FilterDropdownId';

export const AddFilterFromDropdownButton = () => {
  const { toggleDropdown } = useDropdown({
    dropdownScopeId: FilterDropdownId,
  });

  const handleClick = () => {
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
