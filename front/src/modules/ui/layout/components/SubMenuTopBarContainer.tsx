import { JSX } from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { PageHeader } from './PageHeader';
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

export function SubMenuTopBarContainer({
  children,
  title,
  Icon,
}: SubMenuTopBarContainerProps) {
  const isMobile = useIsMobile();

  return (
    <StyledContainer isMobile={isMobile}>
      {isMobile && <PageHeader title={title} Icon={Icon} />}
      <RightDrawerContainer topMargin={16}>{children}</RightDrawerContainer>
    </StyledContainer>
  );
}
