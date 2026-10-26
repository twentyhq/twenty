import { styled } from '@linaria/react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';

const StyledBreadcrumb = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

export const AiChatInboxBreadcrumb = () => {
  return (
    <UndecoratedLink to={getAppPath(AppPath.AiChatInbox, { threadId: null })}>
      <StyledBreadcrumb>
        <AiChatInboxViewHeading />
        <span aria-hidden>/</span>
      </StyledBreadcrumb>
    </UndecoratedLink>
  );
};
