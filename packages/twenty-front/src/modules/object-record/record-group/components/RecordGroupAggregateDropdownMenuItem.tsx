import { ListItem } from 'twenty-ui/primitives/navigation';
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
    <ListItem
      onClick={onContentChange}
      hasSubmenu={hasSubMenu}
      endIcon={<SelectOptionIcon Icon={RightIcon} />}
    >
      {text}
    </ListItem>
  );
};
