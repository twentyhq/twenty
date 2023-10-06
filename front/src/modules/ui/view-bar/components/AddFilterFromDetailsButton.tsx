import { LightButton } from '@/ui/button/components/LightButton';
import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { IconPlus } from '@/ui/icon';

import { FilterDropdownId } from '../constants/FilterDropdownId';

export const AddFilterFromDropdownButton = () => {
  const { toggleDropdown } = useDropdown({
    dropdownId: FilterDropdownId,
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
