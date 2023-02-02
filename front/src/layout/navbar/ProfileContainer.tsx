import styled from '@emotion/styled';
import { User } from '../../interfaces/user.interface';

type OwnProps = {
  user?: User;
};

const StyledContainer = styled.button`
  display: flex;
  height: 60px;
  background: inherit;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 14px;
  margin-bottom: -2px;
  cursor: pointer;
  border: 0;
`;

const StyledInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledEmail = styled.div`
  display: flex;
`;

const StyledTenant = styled.div`
  display: flex;
  text-transform: capitalize;
  font-weight: bold;
`;

const StyledAvatar = styled.div`
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background: black;
  font-size: 20px;
  color: white;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
`;

function ProfileContainer({ user }: OwnProps) {
  return (
    <StyledContainer>
      <StyledAvatar>
        {user?.first_name
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </StyledAvatar>
      <StyledInfoContainer>
        <StyledEmail>{user?.email}</StyledEmail>
        <StyledTenant>{user?.tenant?.name}</StyledTenant>
      </StyledInfoContainer>
    </StyledContainer>
  );
}

export default ProfileContainer;
