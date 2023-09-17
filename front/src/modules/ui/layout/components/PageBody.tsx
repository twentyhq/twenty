import { PAGE_BAR_MIN_HEIGHT } from './PageHeader';
import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
};

export const PageBody = ({ children }: OwnProps) => (
  <RightDrawerContainer topMargin={PAGE_BAR_MIN_HEIGHT + 16 + 16}>
    {children}
  </RightDrawerContainer>
);
