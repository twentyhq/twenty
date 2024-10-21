import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar, AvatarType, getImageAbsoluteURI, IconComponent } from 'twenty-ui';
import { NavigationBarItem } from './NavigationBarItem';
import { useNavigate } from 'react-router-dom';
import { workspaceLogoUrl } from '~/testing/mock-data/users';
import { getAbsoluteUrl } from '~/utils/url/getAbsoluteUrl';

const theme = useTheme()
const StyledContainer = styled.div`
display: flex;
gap: ${({ theme }) => theme.spacing(4)};
  justify-content: left;
  padding: ${({ theme }) => theme.spacing(3)};
  z-index: 1001;
  overflow: scroll;
  `;

const StyledAvatar = styled(Avatar)`
  :hover {
    cursor: grab;
  }
`;

const FavoritesHighlight = styled.div`
    width: 24,
    backgroundColor: theme.background.transparent.lighter,
    border: 1px solid ${theme.background.transparent.lighter},
    borderRadius: theme.border.radius.sm,
`;

const currentWorkspace = useRecoilValue(currentWorkspaceState);
const navigate = useNavigate()

type NavigationBarProps = {
  activeItemName: string;
  favorites: {
    id: string;
    name: string;
    labelIdentifier: string;
    avatarUrl: string;
    avatarType: AvatarType;
    link: string;
    recordId: string;
    onClick: () => void;
  }[];
  objectMetaData: {
    id: string,
    Icon: IconComponent,
    isActive: boolean,
    onclick: () => void
  }[];
};

export const NavigationBar = ({
  activeItemName,
  favorites,
  objectMetaData
}: NavigationBarProps) => {

  return (
  <StyledContainer>
    <FavoritesHighlight>
      <NavigationBarItem 
        key="workspaceLogo" 
        Icon={() => (
          <StyledAvatar
            avatarUrl={getAbsoluteUrl(currentWorkspace?.logo as string) ?? undefined}
            placeholder="Workspace Logo"
            className="fav-avatar"
          />
        )}
        isActive={false}
        onClick={() => navigate("")}
      />
    {favorites.map((favItem) => (
      <NavigationBarItem
        key={favItem.id}
        Icon={() => (
          <StyledAvatar
            placeholderColorSeed={favItem.recordId}
            avatarUrl={favItem.avatarUrl}
            type={favItem.avatarType}
            placeholder={favItem.labelIdentifier}
            className="fav-avatar"
          />
        )}
        isActive={false}
        onClick={favItem.onClick}
      />
    ))}
    </FavoritesHighlight>
    {objectMetaData.map((object) => (
      <NavigationBarItem
      key={object.id}
      Icon={object.Icon}
      isActive={object.isActive}
      onClick={object.onclick}
      />
    ))}
  </StyledContainer>
)};
