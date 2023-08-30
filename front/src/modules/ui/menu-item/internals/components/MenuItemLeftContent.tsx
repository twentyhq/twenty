import { useTheme } from '@emotion/react';

import { IconComponent } from '@/ui/icon/types/IconComponent';

import {
  StyledMenuItemIconContainer,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from './StyledMenuItemBase';

type OwnProps = {
  LeftIcon?: IconComponent;
  text: string;
};

export function MenuItemLeftContent({ LeftIcon, text }: OwnProps) {
  const theme = useTheme();

  return (
    <StyledMenuItemLeftContent>
      {LeftIcon && (
        <StyledMenuItemIconContainer>
          <LeftIcon size={theme.icon.size.md} />
        </StyledMenuItemIconContainer>
      )}
      <StyledMenuItemLabel hasLeftIcon={!!LeftIcon}>{text}</StyledMenuItemLabel>
    </StyledMenuItemLeftContent>
  );
}
