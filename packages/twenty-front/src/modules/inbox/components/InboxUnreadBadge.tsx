import { styled } from '@linaria/react';

import { INBOX_UNREAD_BADGE_MAX_COUNT } from '@/inbox/constants/InboxUnreadBadgeMaxCount';
import { useInboxCounts } from '@/inbox/hooks/useInboxCounts';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledBadge = styled.span`
  align-items: center;
  background: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.xxs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  min-width: ${themeCssVariables.spacing[4]};
  padding: 0 ${themeCssVariables.spacing[1]};
`;

export const InboxUnreadBadge = () => {
  const { inboxCounts } = useInboxCounts();

  const unreadCount = inboxCounts?.unread ?? 0;

  if (unreadCount === 0) {
    return null;
  }

  return (
    <StyledBadge>
      {unreadCount > INBOX_UNREAD_BADGE_MAX_COUNT
        ? `${INBOX_UNREAD_BADGE_MAX_COUNT}+`
        : unreadCount}
    </StyledBadge>
  );
};
