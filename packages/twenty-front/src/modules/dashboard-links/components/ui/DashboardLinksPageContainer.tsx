// src/modules/dashboard-links/components/ui/DashboardLinksPageContainer.tsx
import styled from '@emotion/styled';
import { ReactNode } from 'react';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 95vh;
  margin-top: ${({ theme }: any) => theme.spacing(1)};
  width: 100%;
  padding: ${({ theme }: any) => theme.spacing(2)};
`;

type DashboardPageContainerProps = {
  children: ReactNode;
};

export const DashboardPageContainer = ({
  children,
}: DashboardPageContainerProps) => (
  <StyledPageContainer>{children}</StyledPageContainer>
);
