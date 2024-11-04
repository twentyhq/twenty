import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { ObjectFilterDropdownFilterOperandSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterOperandSelect';

type ObjectFilterOperandSelectAndInputProps = {
  filterDropdownId?: string;
};

export const ObjectFilterOperandSelectAndInput = ({
  filterDropdownId,
}: ObjectFilterOperandSelectAndInputProps) => {
  return (
    <>
      <ObjectFilterDropdownFilterOperandSelect
        filterDropdownId={filterDropdownId}
      />
      <ObjectFilterDropdownFilterInput filterDropdownId={filterDropdownId} />
    </>
  );
};
