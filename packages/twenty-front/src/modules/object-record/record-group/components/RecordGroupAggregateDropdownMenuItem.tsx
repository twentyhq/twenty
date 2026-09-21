import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { type IconComponent } from 'twenty-ui/icon';

export const RecordGroupAggregateDropdownMenuItem = ({
  onContentChange,
  text,
  hasSubMenu,
  RightIcon,
}: {
  onContentChange: () => void;
  hasSubMenu: boolean;
  text: string;
  RightIcon?: IconComponent | null;
}) => {
  return (
    <DropdownListItem
      onClick={onContentChange}
      hasSubmenu={hasSubMenu}
      endIcon={<SelectOptionIcon Icon={RightIcon} />}
    >
      {text}
    </DropdownListItem>
  );
};
