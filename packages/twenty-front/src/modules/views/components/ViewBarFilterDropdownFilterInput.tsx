import { ObjectFilterDropdownContentWrapper } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownContentWrapper';
import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

type ViewBarFilterDropdownFilterInputProps = {
  recordFilterId?: string;
};

export const ViewBarFilterDropdownFilterInput = ({
  recordFilterId,
}: ViewBarFilterDropdownFilterInputProps) => {
  const filterDropdownId = useAvailableComponentInstanceIdOrThrow(
    ObjectFilterDropdownComponentInstanceContext,
  );

  return (
    <ObjectFilterDropdownContentWrapper>
      <ViewBarFilterDropdownFilterInputMenuHeader />
      <ObjectFilterDropdownFilterInput
        filterDropdownId={filterDropdownId}
        recordFilterId={recordFilterId}
      />
    </ObjectFilterDropdownContentWrapper>
  );
};
