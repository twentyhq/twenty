import { ObjectFilterDropdownFilterInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterInput';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownSearchInputIsVisibleComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputIsVisibleComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { ObjectFilterDropdownSearchInput } from '@/views/components/ObjectFilterDropdownSearchInput';
import { ViewBarFilterDropdownFieldSelectMenu } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

export const ViewBarFilterDropdownContent = () => {
  const [objectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const [showSearchInput, setShowSearchInput] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputIsVisibleComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const shouldShowFilterInput = objectFilterDropdownFilterIsSelected;

  return (
    <>
      {showSearchInput ? (
        <ObjectFilterDropdownSearchInput />
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
