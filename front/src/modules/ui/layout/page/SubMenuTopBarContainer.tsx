import { JSX } from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { PAGE_BAR_MIN_HEIGHT, PageHeader } from './PageHeader';
import { RightDrawerContainer } from './RightDrawerContainer';

type SubMenuTopBarContainerProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  Icon: IconComponent;
};

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme, isMobile }) => (!isMobile ? theme.spacing(4) : 0)};
  width: 100%;
`;

export const SubMenuTopBarContainer = ({
  children,
  title,
  Icon,
}: SubMenuTopBarContainerProps) => {
  const isMobile = useIsMobile();
  const topMargin = isMobile ? PAGE_BAR_MIN_HEIGHT + 16 + 16 : 16;
  return (
    <StyledContainer isMobile={isMobile}>
      {isMobile && <PageHeader title={title} Icon={Icon} />}
      <RightDrawerContainer>{children}</RightDrawerContainer>
    </StyledContainer>
  );
};
