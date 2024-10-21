import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { Avatar, AvatarType, IconComponent } from 'twenty-ui';
import { getAbsoluteUrl } from '~/utils/url/getAbsoluteUrl';
import { NavigationBarItem } from './NavigationBarItem';

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
  width: 24px;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
`;
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
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const navigate = useNavigate()

  return (
  <StyledContainer>
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
