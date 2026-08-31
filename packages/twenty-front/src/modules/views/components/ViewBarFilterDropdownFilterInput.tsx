import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';

type ViewBarFilterDropdownFilterInputProps = {
  recordFilterId?: string;
};

export const ViewBarFilterDropdownFilterInput = ({
  recordFilterId,
}: ViewBarFilterDropdownFilterInputProps) => {
  const { mainDropdownId } = useViewBarFilterDropdownIds();

  return (
    <ObjectFilterDropdownContentWrapper>
      <ViewBarFilterDropdownFilterInputMenuHeader />
      <ObjectFilterDropdownFilterInput
        filterDropdownId={mainDropdownId}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
