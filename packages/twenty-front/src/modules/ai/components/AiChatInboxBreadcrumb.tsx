import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';

const StyledBreadcrumbLink = styled(Link)`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  text-decoration: none;
  white-space: nowrap;
`;

export const AiChatInboxBreadcrumb = () => {
  return (
    <StyledBreadcrumbLink
      to={getAppPath(AppPath.AiChatInbox, { threadId: null })}
    >
      <AiChatInboxViewHeading />
      <span aria-hidden>/</span>
    </StyledBreadcrumbLink>
  );
};
