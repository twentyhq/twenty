import { useTheme } from '@emotion/react';

import { Button } from '@/ui/button/components/Button';
import { IconButton } from '@/ui/button/components/IconButton';
import { IconButtonGroup } from '@/ui/button/components/IconButtonGroup';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import { StyledMenuItemBase } from '../internals/components/StyledMenuItemBase';
import { MenuItemAccent } from '../types/MenuItemAccent';

export type MenuItemIconButton = {
  Icon: IconComponent;
  onClick: () => void;
};

export type MenuItemProps = {
  LeftIcon?: IconComponent;
  accent: MenuItemAccent;
  text: string;
  iconButtons?: MenuItemIconButton[];
  className: string;
  onClick?: () => void;
};

export function MenuItem({
  LeftIcon,
  accent,
  text,
  iconButtons,
  className,
  onClick,
}: MenuItemProps) {
  const theme = useTheme();

  const showOneIconButton =
    Array.isArray(iconButtons) && iconButtons.length === 1;

  const showMultipleIconButtons =
    Array.isArray(iconButtons) && iconButtons.length > 1;

  return (
    <StyledMenuItemBase onClick={onClick} className={className} accent={accent}>
      <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
      {showOneIconButton ? (
        <>
          {iconButtons?.map(({ Icon, onClick }, index) => (
            <IconButton
              variant="tertiary"
              size="small"
              icon={<Icon size={theme.icon.size.sm} />}
              key={index}
              accent={accent}
              onClick={onClick}
            />
          ))}
        </>
      ) : showMultipleIconButtons ? (
        <IconButtonGroup size="small" variant="secondary">
          {iconButtons?.map(({ Icon, onClick }, index) => (
            <Button
              icon={<Icon size={theme.icon.size.sm} />}
              key={index}
              onClick={onClick}
              accent={accent}
            />
          ))}
        </IconButtonGroup>
      ) : (
        <></>
      )}
    </StyledMenuItemBase>
  );
}
