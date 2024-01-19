import { TableOptionsDropdownId } from '@/object-record/record-table/constants/TableOptionsDropdownId';
import useI18n from '@/ui/i18n/useI18n';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

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
