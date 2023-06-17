import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { NoTopBarContainer } from '@/ui/layout/containers/NoTopBarContainer';
import { TopTitle } from '@/ui/layout/top-bar/TopTitle';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing(8)};
`;
export function SettingsProfile() {
  const currentUser = useRecoilValue(currentUserState);
  return (
    <NoTopBarContainer>
      <StyledContainer>
        <TopTitle title="Profile" />
        <div>
          <h5>Name</h5>
          <span>{currentUser?.displayName} </span>
        </div>
        <div>
          <h5>Email</h5>
          <span>{currentUser?.email} </span>
        </div>
      </StyledContainer>
    </NoTopBarContainer>
  );
}
