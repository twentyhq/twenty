import { styled } from '@linaria/react';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';

const StyledBreadcrumbContainer = styled.div`
  min-width: 0;
`;

const StyledBreadcrumb = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

export const AiChatInboxBreadcrumb = () => {
  return (
    <StyledBreadcrumbContainer>
      <UndecoratedLink to={getAppPath(AppPath.AiChatInbox, { threadId: null })}>
        <StyledBreadcrumb>
          <AiChatInboxViewHeading />
          <span aria-hidden>/</span>
        </StyledBreadcrumb>
      </UndecoratedLink>
    </StyledBreadcrumbContainer>
  );
};
