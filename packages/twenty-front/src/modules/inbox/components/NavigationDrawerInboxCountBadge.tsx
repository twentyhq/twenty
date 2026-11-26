import { styled } from '@linaria/react';
import { Badge } from 'twenty-ui/primitives/data-display';

const StyledCount = styled.span`
  display: flex;
  padding-right: 3px;
`;

type NavigationDrawerInboxCountBadgeProps = {
  count: number;
};

export const NavigationDrawerInboxCountBadge = ({
  count,
}: NavigationDrawerInboxCountBadgeProps) => (
  <StyledCount>
    <Badge>{count}</Badge>
  </StyledCount>
);
