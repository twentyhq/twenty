import { currentFavoriteFolderIdStateV2 } from '@/ui/navigation/navigation-drawer/states/currentFavoriteFolderIdStateV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconX } from 'twenty-ui/display';

const StyledBackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(1)};
  padding-right: ${({ theme }) => theme.spacing(0.5)};
  padding-top: ${({ theme }) => theme.spacing(1)};
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-family: ${({ theme }) => theme.font.family};
  cursor: pointer;
  text-align: left;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

type FavoritesBackButtonProps = {
  folderName: string;
};

export const FavoritesBackButton = ({
  folderName,
}: FavoritesBackButtonProps) => {
  const theme = useTheme();
  const setCurrentFolderId = useSetRecoilStateV2(
    currentFavoriteFolderIdStateV2,
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentFolderId(null);
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
