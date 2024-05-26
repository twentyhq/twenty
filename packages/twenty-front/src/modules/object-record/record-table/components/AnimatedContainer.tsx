import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledAnimatedChipContainer = styled(motion.div)``;

export const AnimatedContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <StyledAnimatedChipContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.1 }}
    whileHover={{ scale: 1.04 }}
  >
    {children}
  </StyledAnimatedChipContainer>
);
