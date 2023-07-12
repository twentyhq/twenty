import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { TopBarHotkeys } from '../top-bar/TableTopBarHotkeys';
import { TOP_BAR_MIN_HEIGHT, TopBar } from '../top-bar/TopBar';

import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  icon: ReactNode;
  onAddButtonClick?: () => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function WithTopBarContainer({
  children,
  title,
  icon,
  onAddButtonClick,
}: OwnProps) {
  return (
    <StyledContainer>
      <TopBarHotkeys onAddButtonClick={onAddButtonClick} />
      <TopBar title={title} icon={icon} onAddButtonClick={onAddButtonClick} />
      <RightDrawerContainer topMargin={TOP_BAR_MIN_HEIGHT + 16 + 16}>
        {children}
      </RightDrawerContainer>
    </StyledContainer>
  );
}
