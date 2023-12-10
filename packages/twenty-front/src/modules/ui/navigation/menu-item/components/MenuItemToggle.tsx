import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Toggle, ToggleSize } from '@/ui/input/components/Toggle';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemRightContent,
} from '../internals/components/StyledMenuItemBase';

type MenuItemToggleProps = {
  LeftIcon?: IconComponent;
  toggled: boolean;
  text: string;
  className?: string;
  onToggleChange?: (toggled: boolean) => void;
  toggleSize?: ToggleSize;
};

export const MenuItemToggle = ({
  LeftIcon,
  text,
  toggled,
  className,
  onToggleChange,
  toggleSize,
}: MenuItemToggleProps) => {
  const handleOnClick = () => {
    onToggleChange?.(!toggled);
  };

  return (
    <StyledMenuItemBase className={className} onClick={handleOnClick}>
      <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      <StyledMenuItemRightContent>
        <Toggle
          value={toggled}
          onChange={onToggleChange}
          toggleSize={toggleSize}
        />
      </StyledMenuItemRightContent>
    </StyledMenuItemBase>
  );
};
