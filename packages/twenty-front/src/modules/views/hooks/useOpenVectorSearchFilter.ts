import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

export const useOpenVectorSearchFilter = (filterDropdownId?: string) => {
  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    filterDropdownId,
  );

  const setObjectFilterDropdownFilterIsSelected = useSetRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    filterDropdownId,
  );

  const openVectorSearchFilter = () => {
    setObjectFilterDropdownFilterIsSelected(true);
    setSelectedOperandInDropdown(ViewFilterOperand.VectorSearch);
  };

  return {
    openVectorSearchFilter,
  };
};
