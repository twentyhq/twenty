import { TableOptionsDropdownId } from '@/object-record/record-table/constants/TableOptionsDropdownId';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import useI18n from '@/ui/i18n/useI18n';

export const TableOptionsDropdownButton = () => {
  const { translate } = useI18n('translations');
  const { isDropdownOpen, toggleDropdown } = useDropdown(
    TableOptionsDropdownId,
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
