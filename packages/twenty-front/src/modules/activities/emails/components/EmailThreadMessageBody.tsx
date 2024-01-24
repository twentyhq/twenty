import React from 'react';
import styled from '@emotion/styled';

const StyledThreadMessageBody = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(4)};
  white-space: pre-line;
`;

type EmailThreadMessageBodyProps = {
  body: string;
};

export const EmailThreadMessageBody = ({
  body,
}: EmailThreadMessageBodyProps) => {
  return <StyledThreadMessageBody>{body}</StyledThreadMessageBody>;
};
