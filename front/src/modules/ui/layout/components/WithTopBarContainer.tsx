import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { TopBarHotkeys } from '../top-bar/components/TableTopBarHotkeys';
import { TOP_BAR_MIN_HEIGHT, TopBar } from '../top-bar/components/TopBar';

import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  hasBackButton?: boolean;
  icon: ReactNode;
  onAddButtonClick?: () => void;
  onFavouriteButtonClick?: () => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export function WithTopBarContainer({
  children,
  title,
  hasBackButton,
  icon,
  onAddButtonClick,
  onFavouriteButtonClick,
}: OwnProps) {
  return (
    <StyledContainer>
      <TopBarHotkeys onAddButtonClick={onAddButtonClick} />
      <TopBar
        title={title}
        hasBackButton={hasBackButton}
        icon={icon}
        onAddButtonClick={onAddButtonClick}
        onFavouriteButtonClick={onFavouriteButtonClick}
      />
      <RightDrawerContainer topMargin={TOP_BAR_MIN_HEIGHT + 16 + 16}>
        {children}
      </RightDrawerContainer>
    </StyledContainer>
  );
}
