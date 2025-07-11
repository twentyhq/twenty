import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { EditableFilterChipDropdownMenuHeader } from '@/views/components/EditableFilterChipDropdownMenuHeader';

type EditableFilterChipDropdownContentProps = {
  recordFilterId: string;
};

export const EditableFilterChipDropdownContent = ({
  recordFilterId,
}: EditableFilterChipDropdownContentProps) => {
  return (
    <ObjectFilterDropdownContentWrapper>
      <EditableFilterChipDropdownMenuHeader />
      <ObjectFilterDropdownFilterInput
        filterDropdownId={recordFilterId}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
