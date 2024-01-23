import React from 'react';
import styled from '@emotion/styled';

const StyledMessageThreadBody = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing(4)};
  white-space: pre-line;
`;

type MessageThreadBodyProps = {
  body: string;
};

export const MessageThreadBody = ({ body }: MessageThreadBodyProps) => {
  return <StyledMessageThreadBody>{body}</StyledMessageThreadBody>;
};
