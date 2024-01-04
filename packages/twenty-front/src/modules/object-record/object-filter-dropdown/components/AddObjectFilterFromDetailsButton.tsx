import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { IconPlus } from '@/ui/display/icon';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { ObjectFilterDropdownId } from '../constants/ObjectFilterDropdownId';

type AddObjectFilterFromDetailsButtonProps = {
  filterDropdownId?: string;
};

export const AddObjectFilterFromDetailsButton = ({
  filterDropdownId,
}: AddObjectFilterFromDetailsButtonProps) => {
  const { toggleDropdown } = useDropdown(ObjectFilterDropdownId);

  const { resetFilter } = useFilterDropdown({
    filterDropdownId: filterDropdownId,
  });

  const handleClick = () => {
    resetFilter();
    toggleDropdown();
  };

  return (
    <LightButton
      onClick={handleClick}
      Icon={IconPlus}
      title="Add filter"
      accent="tertiary"
    />
  );
};
