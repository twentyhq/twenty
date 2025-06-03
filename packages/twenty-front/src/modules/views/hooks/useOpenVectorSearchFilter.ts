import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

export const useOpenVectorSearchFilter = () => {
  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const setObjectFilterDropdownFilterIsSelected = useSetRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const openVectorSearchFilter = () => {
    setObjectFilterDropdownFilterIsSelected(true);
    setSelectedOperandInDropdown(ViewFilterOperand.VectorSearch);
  };

  return {
    openVectorSearchFilter,
  };
};
