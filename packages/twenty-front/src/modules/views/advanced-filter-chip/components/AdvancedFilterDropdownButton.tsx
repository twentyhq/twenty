import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterRootRecordFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterRootRecordFilterGroup';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { AdvancedFilterChip } from '@/views/advanced-filter-chip/components/AdvancedFilterChip';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';
import { isDefined } from 'twenty-shared/utils';

export const AdvancedFilterDropdownButton = () => {
  const { advancedDropdownId } = useViewBarFilterDropdownIds();

  const rootLevelRecordFilterGroup = useAtomComponentSelectorValue(
    rootLevelRecordFilterGroupComponentSelector,
  );

  const { setAdvancedFilterDropdownStates } =
    useSetAdvancedFilterDropdownStates();

  const handleOpenAdvancedFilterDropdown = () => {
    setAdvancedFilterDropdownStates();
  };

  if (!isDefined(rootLevelRecordFilterGroup)) {
    return null;
  }

  return (
    <Dropdown
      dropdownId={advancedDropdownId}
      clickableComponent={<AdvancedFilterChip />}
      dropdownComponents={<AdvancedFilterRootRecordFilterGroup />}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      onOpen={handleOpenAdvancedFilterDropdown}
    />
  );
};
