import { IconButton } from '@/ui/input/button/components/IconButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { IconDotsVertical } from 'twenty-ui';

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
      variant="tertiary"
      Icon={IconDotsVertical}
      onClick={handleClick}
    />
  );
};
