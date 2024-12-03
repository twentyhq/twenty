import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { ObjectFilterDropdownOperandDropdown } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandDropdown';

type ObjectFilterOperandSelectAndInputProps = {
  filterDropdownId?: string;
};

export const ObjectFilterOperandSelectAndInput = ({
  filterDropdownId,
}: ObjectFilterOperandSelectAndInputProps) => {
  return (
    <>
      <ObjectFilterDropdownOperandDropdown
        filterDropdownId={filterDropdownId}
      />
      <ObjectFilterDropdownFilterInput filterDropdownId={filterDropdownId} />
    </>
  );
};
