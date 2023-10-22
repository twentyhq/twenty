import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';

import { IconChevronRight } from '@/ui/display/icon';
import { IconComponent } from '@/ui/display/icon/types/IconComponent';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
  StyledMenuItemRightContent,
} from '../internals/components/StyledMenuItemBase';

export type MenuItemNavigateProps = {
  LeftIcon?: IconComponent;
  RightSideComponent?: ReactNode;
  text: string;
  onClick?: () => void;
  className?: string;
};

export const MenuItemNavigate = ({
  LeftIcon,
  RightSideComponent,
  text,
  className,
  onClick,
}: MenuItemNavigateProps) => {
  const theme = useTheme();

  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      </StyledMenuItemLeftContent>
      {RightSideComponent ? (
        <StyledMenuItemRightContent>
          {RightSideComponent}
        </StyledMenuItemRightContent>
      ) : (
        <IconChevronRight size={theme.icon.size.sm} />
      )}
    </StyledMenuItemBase>
  );
};
