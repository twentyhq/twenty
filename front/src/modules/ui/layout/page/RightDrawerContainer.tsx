import styled from '@emotion/styled';

import { RightDrawer } from '@/ui/layout/right-drawer/components/RightDrawer';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { PagePanel } from './PagePanel';

type RightDrawerContainerProps = {
  children: JSX.Element | JSX.Element[];
  topMargin?: number;
};

const StyledMainContainer = styled.div<{
  topMargin: number;
  isMobile?: boolean;
}>`
  background: ${({ theme }) => theme.background.noisy};
  display: flex;

  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};
  height: calc(
    100% -
      ${(props) => (props.isMobile ? props.topMargin + 44 : props.topMargin)}px
  );

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
}: RightDrawerContainerProps) => {
  const isMobile = useIsMobile();
  return (
    <StyledMainContainer topMargin={topMargin ?? 0} isMobile={isMobile}>
      <StyledLeftContainer>
        <PagePanel>{children}</PagePanel>
      </StyledLeftContainer>
      <RightDrawer />
    </StyledMainContainer>
  );
};
