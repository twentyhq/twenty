import styled from '@emotion/styled';

import { Tag } from '@/ui/display/tag/components/Tag';
interface ThreadHeaderProps {
  subject: string;
  lastMessageSentAt: string;
}

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  justify-items: end;
  height: 500px;
  align-self: stretch;
  padding: ${({ theme }) => theme.spacing(6)};
  width: 500px;
`;

const StyledHead = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const StyledHeading = styled.h1`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: fit-content;
`;

const StyledContent = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  width: 100%;
`;

const calculateTimeSinceLastMessage = (lastMessageSentAt: string) => {
  const lastMessageSentAtDate = new Date(lastMessageSentAt);
  const now = new Date();

  const differenceInDays = Math.floor(
    (now.getTime() - lastMessageSentAtDate.getTime()) / (1000 * 3600 * 24),
  );

  if (differenceInDays === 0) {
    return 'today';
  }

  if (differenceInDays === 1) {
    return 'yesterday';
  }

  return `${differenceInDays} days ago`;
};

export const ThreadHeader = ({
  subject,
  lastMessageSentAt,
}: ThreadHeaderProps) => {
  return (
    <StyledContainer>
      <Tag color="gray" text="Email" onClick={() => {}} />
      <StyledHead>
        <StyledHeading>{subject}</StyledHeading>
        <StyledContent>
          Last message {calculateTimeSinceLastMessage(lastMessageSentAt)}
        </StyledContent>
      </StyledHead>
    </StyledContainer>
  );
};
