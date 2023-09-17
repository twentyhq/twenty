import { LightButton } from '@/ui/button/components/LightButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconPlus } from '@/ui/icon';

import { FilterDropdownId } from '../constants/FilterDropdownId';

export const AddFilterFromDropdownButton = () => {
  const { toggleDropdownButton } = useDropdownButton({
    dropdownId: FilterDropdownId,
  });

  const handleClick = () => {
    toggleDropdownButton();
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
