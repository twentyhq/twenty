import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: center;
  overflow: ${() => (useIsMobile() ? 'none' : 'hidden')};
  width: calc(100% + 4px);
`;

export type ShowPageRightContainerProps = {
  children: ReactElement;
};

export function ShowPageRightContainer({
  children,
}: ShowPageRightContainerProps) {
  return (
    <StyledShowPageRightContainer>{children} </StyledShowPageRightContainer>
  );
}
