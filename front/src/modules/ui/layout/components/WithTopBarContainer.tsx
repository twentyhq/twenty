import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { PAGE_BAR_MIN_HEIGHT, PageBar } from '../page-bar/components/PageBar';
import { PageBarHotkeys } from '../page-bar/components/PageBarHotkeys';

import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  hasBackButton?: boolean;
  isFavorite?: boolean;
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
  isFavorite,
  icon,
  onAddButtonClick,
  onFavouriteButtonClick,
}: OwnProps) {
  return (
    <StyledContainer>
      <PageBarHotkeys onAddButtonClick={onAddButtonClick} />
      <PageBar
        title={title}
        hasBackButton={hasBackButton}
        isFavorite={isFavorite}
        icon={icon}
        onAddButtonClick={onAddButtonClick}
        onFavouriteButtonClick={onFavouriteButtonClick}
      />
      <RightDrawerContainer topMargin={PAGE_BAR_MIN_HEIGHT + 16 + 16}>
        {children}
      </RightDrawerContainer>
    </StyledContainer>
  );
}
