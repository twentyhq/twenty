import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { EditableFilterChipDropdownMenuHeader } from '@/views/editable-chip/components/EditableFilterChipDropdownMenuHeader';

type EditableFilterChipDropdownContentProps = {
  recordFilterId: string;
  filterDropdownId: string;
};

export const EditableFilterChipDropdownContent = ({
  recordFilterId,
  filterDropdownId,
}: EditableFilterChipDropdownContentProps) => {
  return (
    <ObjectFilterDropdownContentWrapper>
      <EditableFilterChipDropdownMenuHeader />
      <ObjectFilterDropdownFilterInput
        filterDropdownId={filterDropdownId}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
