import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

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
        filterDropdownId={ViewBarFilterDropdownIds.MAIN}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
