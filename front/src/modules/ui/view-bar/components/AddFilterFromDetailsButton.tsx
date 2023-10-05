import { LightButton } from '@/ui/button/components/LightButton';
import { IconPlus } from '@/ui/icon';
import { useViewBarDropdownButton } from '@/ui/view-bar/hooks/useViewBarDropdownButton';

import { FilterDropdownId } from '../constants/FilterDropdownId';

export const AddFilterFromDropdownButton = () => {
  const { toggleDropdown } = useViewBarDropdownButton({
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
