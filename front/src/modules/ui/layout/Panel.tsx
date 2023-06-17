import React from 'react';
import styled from '@emotion/styled';

const StyledPanel = styled.div`
  background: ${(props) => props.theme.primaryBackground};
  border: 1px solid ${(props) => props.theme.primaryBorder};
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  width: 100%;
`;

export function Panel({ children }: { children: React.ReactNode }) {
  return <StyledPanel>{children}</StyledPanel>;
}
