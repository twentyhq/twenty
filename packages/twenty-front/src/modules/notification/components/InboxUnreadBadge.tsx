import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useUnreadNotificationsCount } from '@/notification/hooks/useUnreadNotificationsCount';

const StyledUnreadBadge = styled.span`
  background: ${themeCssVariables.color.blue};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.inverted};
  font-size: 10px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  line-height: 14px;
  min-width: 14px;
  padding: 0 3px;
  text-align: center;
`;

export const InboxUnreadBadge = () => {
  const { unreadCount } = useUnreadNotificationsCount();

  if (unreadCount === 0) {
    return null;
  }

  return (
    <StyledUnreadBadge>
      {unreadCount > 9 ? '9+' : unreadCount}
    </StyledUnreadBadge>
  );
};
