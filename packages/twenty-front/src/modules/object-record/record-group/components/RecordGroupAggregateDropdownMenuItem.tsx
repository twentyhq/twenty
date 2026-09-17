import { type IconComponent } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/primitives/navigation';

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
    <MenuItem
      onClick={onContentChange}
      text={text}
      hasSubMenu={hasSubMenu}
      RightIcon={RightIcon}
    />
  );
};
