import { LightButton } from '@/ui/button/components/LightButton';
import { useDropdownButton } from '@/ui/dropdown/hooks/useDropdownButton';
import { IconPlus } from '@/ui/icon';

import { FilterDropdownKey } from '../types/FilterDropdownKey';

export function AddFilterFromDropdownButton() {
  const { toggleDropdownButton } = useDropdownButton({
    key: FilterDropdownKey,
  });

  function handleClick() {
    toggleDropdownButton();
  }

  return (
    <LightButton
      onClick={handleClick}
      icon={<IconPlus />}
      title="Add filter"
      accent="tertiary"
    />
  );
}
