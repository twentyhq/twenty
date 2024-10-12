import { IconButton } from '@/ui/input/button/components/IconButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { IconDotsVertical } from 'twenty-ui';

interface AdvancedFilterRuleOptionsDropdownButtonProps {
  dropdownId: string;
}

export const AdvancedFilterRuleOptionsDropdownButton = (
  props: AdvancedFilterRuleOptionsDropdownButtonProps,
) => {
  const { toggleDropdown } = useDropdown(props.dropdownId);

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
