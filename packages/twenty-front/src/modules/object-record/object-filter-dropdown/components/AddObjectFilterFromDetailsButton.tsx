import { IconPlus, LightButton } from 'twenty-ui';

import { OBJECT_FILTER_DROPDOWN_ID } from '@/object-record/object-filter-dropdown/constants/ObjectFilterDropdownId';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
type AddObjectFilterFromDetailsButtonProps = {
  filterDropdownId?: string;
};

export const AddObjectFilterFromDetailsButton = ({
  filterDropdownId,
}: AddObjectFilterFromDetailsButtonProps) => {
  const { toggleDropdown } = useDropdown(OBJECT_FILTER_DROPDOWN_ID);

  const { resetFilterDropdown } = useResetFilterDropdown(filterDropdownId);

  const handleClick = () => {
    resetFilterDropdown();
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
