import { styled } from '@linaria/react';
import { IconX } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { NAVIGATION_DRAWER_ITEM_HOVER_BACKGROUND } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerItemHoverBackground';
import { EASE_OUT_CSS } from '@/ui/theme/constants/EaseOutCss';

const StyledBackButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[0.5]};
  padding-top: ${themeCssVariables.spacing[1]};
  text-align: left;
  transition: background-color
    calc(${themeCssVariables.animation.duration.fast} * 1s) ${EASE_OUT_CSS};
  width: 100%;

  &:hover {
    background: ${NAVIGATION_DRAWER_ITEM_HOVER_BACKGROUND};
  }
`;

type NavigationMenuItemBackButtonProps = {
  folderName: string;
};

export const NavigationMenuItemBackButton = ({
  folderName,
}: NavigationMenuItemBackButtonProps) => {
  const theme = useTheme();
  const setCurrentNavigationMenuItemFolderId = useSetAtomState(
    currentNavigationMenuItemFolderIdState,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentNavigationMenuItemFolderId(null);
  };

  return (
    <StyledBackButton onClick={handleClick}>
      <IconX
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.lg}
        color={theme.font.color.tertiary}
      />
      <span>{folderName}</span>
    </StyledBackButton>
  );
};
