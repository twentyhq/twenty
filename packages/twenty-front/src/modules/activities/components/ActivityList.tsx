import { styled } from '@linaria/react';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledListContainer = styled.div`
  width: 100%;

  &[data-scrollable] {
    flex: 1;
    height: 100%;
    min-height: 0;

    > * {
      box-sizing: border-box;
      height: 100%;
      overflow-y: auto;
    }
  }

  > * {
    & > :not(:last-child) {
      border-bottom: 1px solid ${themeCssVariables.border.color.light};
    }
    width: calc(100% - 2px);
  }
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
      <Card>{children}</Card>
    </StyledListContainer>
  );
};
