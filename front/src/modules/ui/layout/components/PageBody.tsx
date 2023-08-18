import { PAGE_BAR_MIN_HEIGHT } from '../page-bar/components/PageBar';

import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
};

export function PageBody({ children }: OwnProps) {
  return (
    <RightDrawerContainer topMargin={PAGE_BAR_MIN_HEIGHT + 16 + 16}>
      {children}
    </RightDrawerContainer>
  );
}
