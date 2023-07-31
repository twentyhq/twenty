import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { PAGE_BAR_MIN_HEIGHT, PageBar } from '../page-bar/components/PageBar';
import { PageBarHotkeys } from '../page-bar/components/PageBarHotkeys';

import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  hasBackButton?: boolean;
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
  hasBackButton,
  icon,
  onAddButtonClick,
}: OwnProps) {
  return (
    <StyledContainer>
      <PageBarHotkeys onAddButtonClick={onAddButtonClick} />
      <PageBar
        title={title}
        hasBackButton={hasBackButton}
        icon={icon}
        onAddButtonClick={onAddButtonClick}
      />
      <RightDrawerContainer topMargin={PAGE_BAR_MIN_HEIGHT + 16 + 16}>
        {children}
      </RightDrawerContainer>
    </StyledContainer>
  );
}
