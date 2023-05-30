import styled from '@emotion/styled';
import React from 'react';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

export function MainContainer({ children }: { children: React.ReactNode }) {
  return <StyledMainContainer>{children}</StyledMainContainer>;
}
