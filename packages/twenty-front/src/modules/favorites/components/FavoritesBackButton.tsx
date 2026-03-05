import { currentFavoriteFolderIdState } from '@/ui/navigation/navigation-drawer/states/currentFavoriteFolderIdState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { IconX } from 'twenty-ui/display';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[0.5]};
  padding-top: ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing[1]};
  width: 100%;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  font-weight: ${themeCssVariables.font.weight.medium};
  font-family: ${themeCssVariables.font.family};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
    border-radius: ${themeCssVariables.border.radius.sm};
  }
`;

type FavoritesBackButtonProps = {
  folderName: string;
};

export const FavoritesBackButton = ({
  folderName,
}: FavoritesBackButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const setCurrentFavoriteFolderId = useSetAtomState(
    currentFavoriteFolderIdState,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentFavoriteFolderId(null);
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
