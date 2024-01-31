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
        x: [-16, -12, 0, 12, 16],
        width: [8, 8, 12, 8, 8],
        height: [8, 8, 2, 8, 8],
      }}
      transition={{
        duration: 1,
        times: [0, 0.1, 0.25, 0.4, 0.5],
        repeat: Infinity,
      }}
    />
  </StyledLoaderContainer>
);
