import { ComponentType, JSX } from 'react';
import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { PageHeader } from './PageHeader';
import { RightDrawerContainer } from './RightDrawerContainer';

type OwnProps<T> = {
  children: JSX.Element | JSX.Element[];
  title: string;
  Icon: ComponentType<T>;
  iconProps: T;
};

const StyledContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${({ theme, isMobile }) => (!isMobile ? theme.spacing(4) : 0)};
  width: 100%;
`;

export function SubMenuTopBarContainer<T extends Record<string, unknown>>({
  children,
  title,
  Icon,
  iconProps,
}: OwnProps<T>) {
  const isMobile = useIsMobile();

  return (
    <StyledContainer isMobile={isMobile}>
      {isMobile && (
        <PageHeader title={title} Icon={Icon} iconProps={iconProps} />
      )}
      <RightDrawerContainer topMargin={16}>{children}</RightDrawerContainer>
    </StyledContainer>
  );
}
