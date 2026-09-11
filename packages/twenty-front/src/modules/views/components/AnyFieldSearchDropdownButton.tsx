import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { DROPDOWN_OFFSET_Y } from '@/ui/layout/dropdown/constants/DropdownOffsetY';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { AnyFieldSearchChip } from '@/views/components/AnyFieldSearchChip';
import { AnyFieldSearchDropdownContent } from '@/views/components/AnyFieldSearchDropdownContent';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getAnyFieldSearchDropdownId } from '@/views/utils/getAnyFieldSearchDropdownId';

export const AnyFieldSearchDropdownButton = () => {
  const { openDropdown } = useOpenDropdown();
  const { recordIndexId } = useRecordIndexContextOrThrow();
  const dropdownId = getAnyFieldSearchDropdownId(recordIndexId);

  const handleOpenAnyFieldSearchDropdown = () => {
    openDropdown({
      dropdownComponentInstanceIdFromProps: dropdownId,
    });
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      clickableComponent={<AnyFieldSearchChip />}
      dropdownComponents={<AnyFieldSearchDropdownContent />}
      dropdownOffset={{ y: DROPDOWN_OFFSET_Y, x: 0 }}
      dropdownPlacement="bottom-start"
      onOpen={handleOpenAnyFieldSearchDropdown}
    />
  );
};
