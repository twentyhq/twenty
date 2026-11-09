import { styled } from '@linaria/react';

import { themeCssVariables } from 'twenty-ui/theme';

export const StyledChatMessageBubble = styled.div<{
  isUser?: boolean;
  isOtherMember?: boolean;
}>`
  background: ${({ isUser, isOtherMember }) => {
    if (isOtherMember) {
      return themeCssVariables.background.secondary;
    }

    if (isUser) {
      return themeCssVariables.background.tertiary;
    }

    return 'transparent';
  }};
  border: ${({ isOtherMember }) =>
    isOtherMember
      ? `1px solid ${themeCssVariables.border.color.medium}`
      : 'none'};
  border-radius: ${({ isUser }) =>
    isUser ? themeCssVariables.border.radius.lgRound : '0'};
  color: ${({ isUser }) =>
    isUser
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  corner-shape: round;
  font-weight: ${({ isUser }) => (isUser ? 500 : 400)};
  line-height: ${themeCssVariables.spacing[6]};
  max-width: 100%;
  overflow-wrap: break-word;
  padding: ${({ isUser }) =>
    isUser ? `0 ${themeCssVariables.spacing[2]}` : '0'};
  white-space: normal;
  width: ${({ isUser }) => (isUser ? 'fit-content' : '100%')};
  /* Pre-wrap on the container turns newlines between blocks into spacing; only code pre-wraps. */
  word-wrap: break-word;

  code {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    line-height: 1.4;
    max-width: 100%;
    overflow: auto;
    padding: 1px 3px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  pre {
    background: ${themeCssVariables.background.tertiary};
    border-radius: ${themeCssVariables.border.radius.sm};
    max-width: 100%;
    overflow-x: auto;
    padding: ${themeCssVariables.spacing[2]};

    code {
      background: none;
      border-radius: 0;
      padding: 0;
    }
  }

  p {
    line-height: inherit;
    margin-block: ${({ isUser }) =>
      isUser ? '0' : themeCssVariables.spacing[1]};
  }

  blockquote {
    border-left: 3px solid ${themeCssVariables.border.color.medium};
    color: ${themeCssVariables.font.color.secondary};
    margin: ${themeCssVariables.spacing[2]} 0;
    padding-left: ${themeCssVariables.spacing[2]};
  }
`;
