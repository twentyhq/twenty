import { IconPlus } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

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
