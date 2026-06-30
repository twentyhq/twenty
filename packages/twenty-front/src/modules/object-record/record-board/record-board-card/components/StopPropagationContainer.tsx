import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

const StyledFieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
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
