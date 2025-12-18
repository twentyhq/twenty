import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { EditableFilterChipDropdownMenuHeader } from '@/views/components/EditableFilterChipDropdownMenuHeader';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

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
        filterDropdownId={ViewBarFilterDropdownIds.EDITABLE_CHIP}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
