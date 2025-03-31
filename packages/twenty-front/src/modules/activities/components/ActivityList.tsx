import styled from '@emotion/styled';
import { Card } from 'twenty-ui/layout';

const StyledList = styled(Card)`
  & > :not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  }

  width: calc(100% - 2px);

  overflow: auto;
`;

export const ActivityList = ({ children }: React.PropsWithChildren) => {
  return <StyledList>{children}</StyledList>;
};
