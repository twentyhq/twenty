import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { type IconComponent } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
      onClick={getDropdownMenuItemClickHandler(onContentChange)}
      hasSubmenu={hasSubMenu}
      endIcon={<SelectOptionIcon Icon={RightIcon} />}
    >
      <OverflowingTextWithTooltip text={text} />
    </ListItem>
  );
};
