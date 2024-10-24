import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { IconButton, IconDotsVertical } from 'twenty-ui';

type AdvancedFilterRuleOptionsDropdownButtonProps = {
  dropdownId: string;
};

export const AdvancedFilterRuleOptionsDropdownButton = ({
  dropdownId,
}: AdvancedFilterRuleOptionsDropdownButtonProps) => {
  const { toggleDropdown } = useDropdown(dropdownId);

  const handleClick = () => {
    toggleDropdown();
  };

  return (
    <IconButton
      aria-label="Filter rule options"
      variant="tertiary"
      Icon={IconDotsVertical}
      onClick={handleClick}
    />
  );
};
