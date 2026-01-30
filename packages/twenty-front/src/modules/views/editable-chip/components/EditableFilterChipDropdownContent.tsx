import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { EditableFilterChipDropdownMenuHeader } from '@/views/editable-chip/components/EditableFilterChipDropdownMenuHeader';
import { getEditableChipDropdownId } from '@/views/editable-chip/utils/getEditableChipDropdownId';

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
        filterDropdownId={getEditableChipDropdownId({ recordFilterId })}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
