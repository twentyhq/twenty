import React from 'react';
import styled from '@emotion/styled';

const StyledPanel = styled.div`
  display: flex;
  background: ${(props) => props.theme.primaryBackground};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.primaryBorder};
  width: 100%;
`;

export function Panel({ children }: { children: React.ReactNode }) {
  return <StyledPanel>{children}</StyledPanel>;
}
