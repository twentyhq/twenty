import { AdvancedFilterFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectMenu';
import { AdvancedFilterSubFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterSubFieldSelectMenu';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

type AdvancedFilterFieldSelectDropdownContentProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDropdownContent = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDropdownContentProps) => {
  const [objectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentState(
      objectFilterDropdownIsSelectingCompositeFieldComponentState,
    );

  const shouldShowCompositeSelectionSubMenu =
    objectFilterDropdownIsSelectingCompositeField;

  return shouldShowCompositeSelectionSubMenu ? (
    <AdvancedFilterSubFieldSelectMenu recordFilterId={recordFilterId} />
  ) : (
    <AdvancedFilterFieldSelectMenu recordFilterId={recordFilterId} />
  );
};
