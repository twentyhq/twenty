import React from 'react';
import styled from '@emotion/styled';

const StyledMessageThreadBodyPreview = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type MessageThreadBodyPreviewProps = {
  body: string;
};

export const MessageThreadBodyPreview = ({
  body,
}: MessageThreadBodyPreviewProps) => {
  return (
    <StyledMessageThreadBodyPreview>{body}</StyledMessageThreadBodyPreview>
  );
};
