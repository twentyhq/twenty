import { ReactNode } from 'react';
import styled from '@emotion/styled';

import { TOP_BAR_MIN_HEIGHT, TopBar } from '../top-bar/TopBar';

import { ContentContainer } from './ContentContainer';

type OwnProps = {
  children: JSX.Element;
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
      <TopBar title={title} icon={icon} onAddButtonClick={onAddButtonClick} />
      <ContentContainer topMargin={TOP_BAR_MIN_HEIGHT + 16 + 16}>
        {children}
      </ContentContainer>
    </StyledContainer>
  );
}
