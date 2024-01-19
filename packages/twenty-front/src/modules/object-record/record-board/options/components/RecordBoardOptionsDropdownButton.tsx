import { BoardOptionsDropdownId } from '@/object-record/record-board/constants/BoardOptionsDropdownId';
import useI18n from '@/ui/i18n/useI18n';
import { StyledHeaderDropdownButton } from '@/ui/layout/dropdown/components/StyledHeaderDropdownButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const RecordBoardOptionsDropdownButton = () => {
  const { translate } = useI18n('translations');
  const { isDropdownOpen, toggleDropdown } = useDropdown(
    BoardOptionsDropdownId,
  );

  const handleClick = () => {
    toggleDropdown();
  };

  return (
    <StyledHeaderDropdownButton
      isUnfolded={isDropdownOpen}
      onClick={handleClick}
    >
      {translate('options')}
    </StyledHeaderDropdownButton>
  );
};
