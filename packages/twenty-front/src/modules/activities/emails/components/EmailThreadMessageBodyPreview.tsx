import React from 'react';
import styled from '@emotion/styled';

const StyledThreadMessageBodyPreview = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type EmailThreadMessageBodyPreviewProps = {
  body: string;
};

export const EmailThreadMessageBodyPreview = ({
  body,
}: EmailThreadMessageBodyPreviewProps) => {
  return (
    <StyledThreadMessageBodyPreview>{body}</StyledThreadMessageBodyPreview>
  );
};
