import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewBarFilterDropdownAnyFieldSearchInput } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchInput';
import { ViewBarFilterDropdownFieldSelectMenu } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
import { ViewBarFilterDropdownFilterInput } from '@/views/components/ViewBarFilterDropdownFilterInput';
import { ViewBarFilterDropdownVectorSearchInput } from '@/views/components/ViewBarFilterDropdownVectorSearchInput';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { ViewFilterOperand } from 'twenty-shared/types';

export const ViewBarFilterDropdownContent = () => {
  const [objectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const objectFilterDropdownAnyFieldSearchIsSelected =
    useRecoilComponentValueV2(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
    );

  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const isVectorSearchFilter =
    selectedOperandInDropdown === ViewFilterOperand.VectorSearch;

  const isAnyFieldSearchFilter = objectFilterDropdownAnyFieldSearchIsSelected;

  if (isAnyFieldSearchFilter) {
    return <ViewBarFilterDropdownAnyFieldSearchInput />;
  }

  if (isVectorSearchFilter) {
    return <ViewBarFilterDropdownVectorSearchInput />;
  }

  const shouldShowFilterInput = objectFilterDropdownFilterIsSelected;

  return (
    <>
      {shouldShowFilterInput ? (
        <ViewBarFilterDropdownFilterInput />
      ) : (
        <ViewBarFilterDropdownFieldSelectMenu />
      )}
    </>
  );
};
