import { JSX } from 'react';
import styled from '@emotion/styled';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { PageHeader } from './PageHeader';
import { RightDrawerContainer } from './RightDrawerContainer';

type SubMenuTopBarContainerProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  Icon: IconComponent;
  className?: string;
};

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme, isMobile }) => (!isMobile ? theme.spacing(3) : 0)};
  width: 100%;
`;

export const SubMenuTopBarContainer = ({
  children,
  title,
  Icon,
  className,
}: SubMenuTopBarContainerProps) => {
  const isMobile = useIsMobile();

  return (
    <StyledContainer isMobile={isMobile} className={className}>
      {isMobile && <PageHeader title={title} Icon={Icon} />}
      <RightDrawerContainer>{children}</RightDrawerContainer>
    </StyledContainer>
  );
};
