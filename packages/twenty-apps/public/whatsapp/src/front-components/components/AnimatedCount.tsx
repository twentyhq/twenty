import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';

const rollIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(60%);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledContainer = styled.span`
  display: inline-flex;
  overflow: hidden;
  vertical-align: bottom;
`;

const StyledValue = styled.span`
  animation: ${rollIn} 300ms cubic-bezier(0.2, 0, 0, 1);
  display: inline-block;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

type AnimatedCountProps = {
  count: number;
};

export const AnimatedCount = ({ count }: AnimatedCountProps) => (
  <StyledContainer>
    <StyledValue key={count}>{count.toLocaleString()}</StyledValue>
  </StyledContainer>
);
