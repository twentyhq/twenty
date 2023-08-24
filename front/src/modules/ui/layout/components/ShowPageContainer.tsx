import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

export const StyledShowPageContainer = styled.div`
  display: flex;
  flex-direction: ${() => (useIsMobile() ? 'column' : 'row')};
  gap: ${({ theme }) => (useIsMobile() ? theme.spacing(3) : '0')};
  height: ${() => (useIsMobile() ? '100%' : 'auto')};
  overflow-x: ${() => (useIsMobile() ? 'hidden' : 'auto')};
  width: ${() => (useIsMobile() ? `calc(100% - 2px);` : '100%')};
`;

export type ShowPageContainerProps = {
  children: ReactElement[];
};

export function ShowPageContainer({ children }: ShowPageContainerProps) {
  return <StyledShowPageContainer>{children} </StyledShowPageContainer>;
}
