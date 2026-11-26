import { styled } from '@linaria/react';
import { Badge } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledCount = styled.span`
  display: flex;
  padding-right: ${themeCssVariables.spacing['1.5']};
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
