import { useResetFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useResetFilterDropdown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';

import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { isRecordFilterConsideredEmpty } from '@/object-record/record-filter/utils/isRecordFilterConsideredEmpty';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewBarFilterDropdownContent } from '@/views/components/ViewBarFilterDropdownContent';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ViewBarFilterButton } from './ViewBarFilterButton';

type ViewBarFilterDropdownProps = {
  hotkeyScope: HotkeyScope;
};

export const ViewBarFilterDropdown = ({
  hotkeyScope,
}: ViewBarFilterDropdownProps) => {
  const { resetFilterDropdown } = useResetFilterDropdown();

  const { removeRecordFilter } = useRemoveRecordFilter();

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValueV2(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const filterIsSelected = useRecoilComponentValueV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    VIEW_BAR_FILTER_DROPDOWN_ID,
  );

  const isDateFilter =
    isDefined(fieldMetadataItemUsedInDropdown) &&
    (fieldMetadataItemUsedInDropdown.type === FieldMetadataType.DATE ||
      fieldMetadataItemUsedInDropdown.type === FieldMetadataType.DATE_TIME);

  // this does work but feels like a patchwork solution
  // we should find a better way to handle this
  // shouldnt dropdown be responsive to the content?
  const dropdownWidth = filterIsSelected && isDateFilter ? 280 : 208;

  const handleDropdownClickOutside = () => {
    const recordFilterIsEmpty =
      isDefined(objectFilterDropdownCurrentRecordFilter) &&
      isRecordFilterConsideredEmpty(objectFilterDropdownCurrentRecordFilter);

    if (recordFilterIsEmpty) {
      removeRecordFilter({
        recordFilterId: objectFilterDropdownCurrentRecordFilter.id,
      });
    }
  };

  const handleDropdownClose = () => {
    resetFilterDropdown();
  };

  return (
    <Dropdown
      dropdownId={VIEW_BAR_FILTER_DROPDOWN_ID}
      onClose={handleDropdownClose}
      clickableComponent={<ViewBarFilterButton />}
      dropdownComponents={<ViewBarFilterDropdownContent />}
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8 }}
      onClickOutside={handleDropdownClickOutside}
      dropdownWidth={dropdownWidth}
    />
  );
};
