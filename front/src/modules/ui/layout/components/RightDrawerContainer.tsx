import styled from '@emotion/styled';

import { RightDrawer } from '@/ui/right-drawer/components/RightDrawer';

import { PagePanel } from './PagePanel';

type RightDrawerContainerProps = {
  children: JSX.Element | JSX.Element[];
  topMargin?: number;
};

const StyledMainContainer = styled.div<{ topMargin: number }>`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;

  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  height: calc(100% - ${(props) => props.topMargin}px);

  padding-bottom: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
  width: calc(100% - ${({ theme }) => theme.spacing(3)});
`;

type LeftContainerProps = {
  isRightDrawerOpen?: boolean;
};

const StyledLeftContainer = styled.div<LeftContainerProps>`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
`;

export const RightDrawerContainer = ({
  children,
  topMargin,
}: RightDrawerContainerProps) => (
  <StyledMainContainer topMargin={topMargin ?? 0}>
    <StyledLeftContainer>
      <PagePanel>{children}</PagePanel>
    </StyledLeftContainer>
    <RightDrawer />
  </StyledMainContainer>
);
