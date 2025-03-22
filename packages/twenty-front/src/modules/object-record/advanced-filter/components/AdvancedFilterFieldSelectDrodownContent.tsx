import { AdvancedFilterFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectMenu';
import { AdvancedFilterSubFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterSubFieldSelectMenu';
import { objectFilterDropdownIsSelectingCompositeFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingCompositeFieldComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';

type AdvancedFilterFieldSelectDrodownContentProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDrodownContent = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDrodownContentProps) => {
  const [objectFilterDropdownIsSelectingCompositeField] =
    useRecoilComponentStateV2(
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
