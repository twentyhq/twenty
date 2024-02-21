import { RECORD_INDEX_OPTIONS_DROPDOWN_ID } from '@/object-record/record-index/options/constants/RecordIndexOptionsDropdownId';
import useI18n from '@/ui/i18n/useI18n';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const RecordIndexOptionsDropdownButton = () => {
  const { translate } = useI18n('translations');
  const { isDropdownOpen, toggleDropdown } = useDropdown(
    RECORD_INDEX_OPTIONS_DROPDOWN_ID,
  );

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={toggleDropdown}
    >
      {translate('options')}
    </StyledHeaderDropdownButton>
  );
};
