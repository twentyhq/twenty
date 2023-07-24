import styled from '@emotion/styled';

import { useIsMobile } from '../../hooks/useIsMobile';
import { TopBar } from '../top-bar/components/TopBar';

import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  icon: React.ReactNode;
};

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme, isMobile }) => (!isMobile ? theme.spacing(4) : 0)};
  width: 100%;
`;

export function SubMenuTopBarContainer({ children, title, icon }: OwnProps) {
  const isMobile = useIsMobile();

  return (
    <StyledContainer isMobile={isMobile}>
      {isMobile && <TopBar title={title} icon={icon} />}
      <RightDrawerContainer topMargin={16}>{children}</RightDrawerContainer>
    </StyledContainer>
  );
}
