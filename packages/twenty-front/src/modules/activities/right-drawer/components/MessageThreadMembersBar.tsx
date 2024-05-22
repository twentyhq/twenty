import styled from '@emotion/styled';

import { EmailThreadMembersChip } from '@/activities/emails/components/EmailThreadMembersChip';

const StyledButtonContainer = styled.div`
  display: inline-flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const MessageThreadMembersBar = () => {
  return (
    <StyledButtonContainer>
      <EmailThreadMembersChip />
    </StyledButtonContainer>
  );
};
