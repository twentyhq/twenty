import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { ViewFilterOperand } from 'twenty-shared/src/types/ViewFilterOperand';

export const useOpenVectorSearchFilter = (filterDropdownId?: string) => {
  const setSelectedOperandInDropdown = useSetRecoilComponentState(
    selectedOperandInDropdownComponentState,
    filterDropdownId,
  );

  const setObjectFilterDropdownFilterIsSelected = useSetRecoilComponentState(
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
