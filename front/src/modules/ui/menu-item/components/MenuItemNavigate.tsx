import { useTheme } from '@emotion/react';

import { IconChevronRight } from '@/ui/icon';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';

export type MenuItemProps = {
  LeftIcon?: IconComponent;
  text: string;
  onClick?: () => void;
  className?: string;
};

export const MenuItemNavigate = ({
  LeftIcon,
  text,
  className,
  onClick,
}: MenuItemProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      <IconChevronRight size={theme.icon.size.sm} />
    </StyledMenuItemBase>
  );
};
