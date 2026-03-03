import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledList = styled(Card)`
  & > :not(:last-child) {
    border-bottom: 1px solid ${themeCssVariables.border.color.light};
  }

  width: calc(100% - 2px);

  overflow: auto;
`;

export const ActivityList = ({ children }: React.PropsWithChildren) => {
  return <StyledList>{children}</StyledList>;
};
