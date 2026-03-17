import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconX } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { currentNavigationMenuItemFolderIdState } from '@/navigation-menu-item/common/states/currentNavigationMenuItemFolderIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledBackButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
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
  width: 100%;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

type NavigationMenuItemBackButtonProps = {
  folderName: string;
};

export const NavigationMenuItemBackButton = ({
  folderName,
}: NavigationMenuItemBackButtonProps) => {
  const { theme } = useContext(ThemeContext);
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
