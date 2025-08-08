import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { AdvancedFilterRootRecordFilterGroup } from '@/object-record/advanced-filter/components/AdvancedFilterRootRecordFilterGroup';
import { useSetAdvancedFilterDropdownStates } from '@/object-record/advanced-filter/hooks/useSetAdvancedFilterDropdownAllRowsStates';
import { rootLevelRecordFilterGroupComponentSelector } from '@/object-record/advanced-filter/states/rootLevelRecordFilterGroupComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { AdvancedFilterChip } from '@/views/components/AdvancedFilterChip';
import { ADVANCED_FILTER_DROPDOWN_ID } from '@/views/constants/AdvancedFilterDropdownId';
import { isDefined } from 'twenty-shared/utils';

export const AdvancedFilterDropdownButton = () => {
  const rootLevelRecordFilterGroup = useRecoilComponentValue(
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
      dropdownId={ADVANCED_FILTER_DROPDOWN_ID}
      clickableComponent={<AdvancedFilterChip />}
      dropdownComponents={<AdvancedFilterRootRecordFilterGroup />}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      onOpen={handleOpenAdvancedFilterDropdown}
    />
  );
};
