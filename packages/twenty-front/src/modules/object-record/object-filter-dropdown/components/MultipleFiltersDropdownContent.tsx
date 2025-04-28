import { ObjectFilterDropdownSubFieldSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownSubFieldSelect';
import { ObjectFilterOperandSelectAndInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterOperandSelectAndInput';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { ObjectFilterDropdownFieldSelect } from './ObjectFilterDropdownFieldSelect';

type MultipleFiltersDropdownContentProps = {
  filterDropdownId?: string;
};

export const MultipleFiltersDropdownContent = ({
  filterDropdownId,
}: MultipleFiltersDropdownContentProps) => {
  const [objectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
      filterDropdownId,
    );

  const [objectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    filterDropdownId,
  );

  const shouldShowCompositeSelectionSubMenu =
    objectFilterDropdownIsSelectingCompositeField;

  const shouldShowFilterInput = objectFilterDropdownFilterIsSelected;

  return (
    <>
      {shouldShowFilterInput ? (
        <ObjectFilterOperandSelectAndInput
          filterDropdownId={filterDropdownId}
        />
      ) : shouldShowCompositeSelectionSubMenu ? (
        <ObjectFilterDropdownSubFieldSelect />
      ) : (
        <ObjectFilterDropdownFieldSelect isAdvancedFilterButtonVisible />
      )}
    </>
  );
};
