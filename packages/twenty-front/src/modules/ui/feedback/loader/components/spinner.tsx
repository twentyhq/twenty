import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledSpinnerContainer = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) => theme.spacing(24)};
  height: ${({ theme }) => theme.spacing(24)};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  overflow: hidden;
`;

const StyledSpinner = styled(motion.div)`
  background-color: ${({ theme }) => theme.font.color.blue};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  height: 12px;
  width: 12px;
`;

export const Spinner = () => (
  <StyledSpinnerContainer>
    <StyledSpinner
      animate={{
        x: [-44, 21, 44],
        width: [8, 24, 8],
        height: [8, 24, 8],
      }}
      transition={{
        duration: 1.0,
        times: [0, 0.15, 0.3],
        repeat: Infinity,
      }}
    />
  </StyledSpinnerContainer>
);