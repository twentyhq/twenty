import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { ViewBarFilterDropdownFieldSelectMenu } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
import { ViewBarFilterDropdownSearchInput } from '@/views/components/ViewBarFilterDropdownSearchInput';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

export const ViewBarFilterDropdownContent = () => {
  const [objectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const [showSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const shouldShowFilterInput = objectFilterDropdownFilterIsSelected;

  return (
    <>
      {showSearchInput ? (
        <ViewBarFilterDropdownSearchInput
          filterDropdownId={VIEW_BAR_FILTER_DROPDOWN_ID}
        />
      ) : shouldShowFilterInput ? (
        <ObjectFilterDropdownFilterInput
          filterDropdownId={VIEW_BAR_FILTER_DROPDOWN_ID}
        />
      ) : (
        <ViewBarFilterDropdownFieldSelectMenu />
      )}
    </>
  );
};
