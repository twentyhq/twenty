import styled from '@emotion/styled';

export type MessageEvent = {
  id: number;
  user: string;
  time: string;
  channel: string;
  message: string;
  agent?: string;
};

type OwnProps = {
  message: MessageEvent;
};

const StyledMessage = styled.div`
  display: flex;
  margin-top: 12px;
  margin-bottom: 20px;
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

const StyledContent = styled.div``;

const StyledTitle = styled.div`
  display: flex;
  align-items: center;
`;

const StyledUser = styled.div`
  font-size: 16px;
  color: black;
  font-weight: bold;
`;

const StyledTime = styled.div`
  margin-left: 8px;
  font-size: 12px;
  color: #2e3138;
`;

const StyledAgent = styled.div`
  text-decoration: underline;
  margin-left: 4px;
  font-size: 12px;
  color: #2e3138;
`;

const StyledDetails = styled.div`
  margin-top: 8px;
`;

function Message({ message }: OwnProps) {
  return (
    <StyledMessage>
      <StyledAvatar>
        {message.user
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </StyledAvatar>
      <StyledContent>
        <StyledTitle>
          <StyledUser>{message.user}</StyledUser>
          <StyledTime>
            {message.time} ({message.channel})
          </StyledTime>
          {message.agent && <StyledAgent>by {message.agent}</StyledAgent>}
        </StyledTitle>
        <StyledDetails>{message.message}</StyledDetails>
      </StyledContent>
    </StyledMessage>
  );
}

export default Message;
