import { ReactNode } from 'react';
import styled from '@emotion/styled';

const StyledFieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: fit-content;
  max-width: 100%;
`;

export const StopPropagationContainer = ({
  children,
}: {
  children: ReactNode;
}) => (
  <StyledFieldContainer
    onClick={(e) => {
      e.stopPropagation();
    }}
  >
    {children}
  </StyledFieldContainer>
);
