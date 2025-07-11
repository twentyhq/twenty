import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

type ViewBarFilterDropdownFilterInputProps = {
  recordFilterId?: string;
};

export const ViewBarFilterDropdownFilterInput = ({
  recordFilterId,
}: ViewBarFilterDropdownFilterInputProps) => {
  return (
    <ObjectFilterDropdownContentWrapper>
      <ViewBarFilterDropdownFilterInputMenuHeader />
      <ObjectFilterDropdownFilterInput
        filterDropdownId={VIEW_BAR_FILTER_DROPDOWN_ID}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
