import { ObjectFilterDropdownFilterSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelect';
import { ObjectFilterDropdownFilterSelectCompositeFieldSubMenu } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownFilterSelectCompositeFieldSubMenu';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

export const AdvancedFilterFieldSelectDrodownContent = () => {
  const [objectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const shouldShowCompositeSelectionSubMenu =
    objectFilterDropdownIsSelectingCompositeField;

  return shouldShowCompositeSelectionSubMenu ? (
    <ObjectFilterDropdownFilterSelectCompositeFieldSubMenu />
  ) : (
    <ObjectFilterDropdownFilterSelect />
  );
};
