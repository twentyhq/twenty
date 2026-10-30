import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/primitives/surfaces';

const StyledListContainer = styled.div`
  width: 100%;

  &[data-scrollable] {
    flex: 1;
    height: 100%;
    min-height: 0;
  }
`;

const scrollableCardClassName = css`
  height: 100%;
  overflow-y: auto;
`;

type ActivityListProps = React.PropsWithChildren<{
  isScrollable?: boolean;
}>;

export const ActivityList = ({
  children,
  isScrollable = false,
}: ActivityListProps) => {
  return (
    <StyledListContainer data-scrollable={isScrollable || undefined}>
      <Card.Root className={isScrollable ? scrollableCardClassName : undefined}>
        {children}
      </Card.Root>
    </StyledListContainer>
  );
};
