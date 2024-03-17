import { StyledHeaderDropdownButton, useDropdown } from 'twenty-ui';

import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';

export const RecordIndexOptionsDropdownButton = () => {
  const { isDropdownOpen, toggleDropdown } = useDropdown(
    RECORD_INDEX_OPTIONS_DROPDOWN_ID,
  );

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={toggleDropdown}
    >
      Options
    </StyledHeaderDropdownButton>
  );
};
