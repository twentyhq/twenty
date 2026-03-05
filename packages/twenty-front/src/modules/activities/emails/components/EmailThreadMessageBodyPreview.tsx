import React from 'react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledThreadMessageBodyPreview = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${themeCssVariables.font.size.sm};
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
