import { Tag } from '@/ui/display/tag/components/Tag';
import {
  Checkbox,
  CheckboxShape,
  CheckboxSize,
} from '@/ui/input/components/Checkbox';
import { ThemeColor } from '@/ui/theme/constants/MainColorNames';

import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

type MenuItemMultiSelectTagProps = {
  selected: boolean;
  className?: string;
  onClick?: () => void;
  color: ThemeColor;
  text: string;
};

export const MenuItemMultiSelectTag = ({
  color,
  selected,
  className,
  onClick,
  text,
}: MenuItemMultiSelectTagProps) => {
  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <Checkbox
        size={CheckboxSize.Small}
        shape={CheckboxShape.Squared}
        checked={selected}
      />
      <StyledMenuItemLeftContent>
        <Tag color={color} text={text} />
      </StyledMenuItemLeftContent>
    </StyledMenuItemBase>
  );
};
