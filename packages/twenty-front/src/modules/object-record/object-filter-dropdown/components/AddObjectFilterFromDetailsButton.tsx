import { IconPlus } from 'twenty-ui';

import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

type AddObjectFilterFromDetailsButtonProps = {
  filterDropdownId?: string;
};

export const AddObjectFilterFromDetailsButton = ({
  filterDropdownId,
}: AddObjectFilterFromDetailsButtonProps) => {
  const { toggleDropdown } = useDropdown(OBJECT_FILTER_DROPDOWN_ID);

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
