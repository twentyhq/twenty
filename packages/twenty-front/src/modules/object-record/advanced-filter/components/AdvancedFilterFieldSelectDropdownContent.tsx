import { AdvancedFilterFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectMenu';
import { AdvancedFilterSubFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterSubFieldSelectMenu';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';

type AdvancedFilterFieldSelectDropdownContentProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDropdownContent = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDropdownContentProps) => {
  const [objectFilterDropdownIsSelectingCompositeField] = useAtomComponentState(
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
