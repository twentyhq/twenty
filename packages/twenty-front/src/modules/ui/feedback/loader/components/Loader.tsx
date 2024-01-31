import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledLoaderContainer = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  overflow: hidden;
`;

const StyledLoader = styled(motion.div)`
  background-color: ${({ theme }) => theme.font.color.light};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  height: 8px;
  width: 8px;
`;

export const Loader = () => (
  <StyledLoaderContainer>
    <StyledLoader
      animate={{
        x: [-16, 0, 16],
        width: [8, 12, 8],
        height: [8, 2, 8],
      }}
      transition={{
        duration: 1,
        times: [0, 0.3, 0.6],
        repeat: Infinity,
      }}
    />
  </StyledLoaderContainer>
);
