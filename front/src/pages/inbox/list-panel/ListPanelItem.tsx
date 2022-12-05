import styled from '@emotion/styled';
import { Task } from './ListPanel';

type OwnProps = {
  task: Task;
};

const StyledListItem = styled.button`
  display: flex;
  padding: 16px 24px;
  flex-direction: column;
  color: #2e3138;
  border: 0;
  border-bottom: 1px solid #eaecee;
  cursor: pointer;
  font-family: inherit;
  text-align: inherit;
  align-items: inherit;
  background: #f1f3f5;
`;

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledAvatarAndTitle = styled.div`
  display: flex;
`;

const StyledAvatar = styled.div`
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  background: #52555b;
  font-size: 20px;
  color: white;
  align-items: center;
  justify-content: center;
  font-weight: bold;
`;

const StyledTitle = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
`;

const StyledName = styled.div`
  font-weight: bold;
  font-size: 18px;
  color: black;
`;

const StyledLabel = styled.div`
  display: flex;
  font-size: 14px;
`;

const StyledTime = styled.div`
  display: flex;
  justify-self: flex-end;
  color: #7d8187;
  font-size: 14px;
`;

const StyledContent = styled.div`
  display: flex;
  color: #52555b;
  font-size: 14px;
  margin-top: 8px;
`;

function ListPanelItem({ task }: OwnProps) {
  return (
    <StyledListItem>
      <StyledHeader>
        <StyledAvatarAndTitle>
          <StyledAvatar>
            {task.targetUser
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </StyledAvatar>
          <StyledTitle>
            <StyledName>{task.targetUser}</StyledName>
            <StyledLabel>{task.label}</StyledLabel>
          </StyledTitle>
        </StyledAvatarAndTitle>
        <StyledTime>{task.time}</StyledTime>
      </StyledHeader>
      <StyledContent>{task.lastMessage} </StyledContent>
    </StyledListItem>
  );
}

export default ListPanelItem;
