import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledEmptyContainer = styled(motion.div)`
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  justify-content: center;
  text-align: center;
`;

export { StyledEmptyContainer as AnimatedPlaceholderEmptyContainer };

export const EMPTY_PLACEHOLDER_TRANSITION_PROPS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    duration: 0.15,
  },
};

const StyledEmptyTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  text-align: center;
  width: 100%;
`;

export { StyledEmptyTextContainer as AnimatedPlaceholderEmptyTextContainer };

const StyledEmptyTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

export { StyledEmptyTitle as AnimatedPlaceholderEmptyTitle };

const StyledEmptySubTitle = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  max-height: 2.8em;
  overflow: hidden;
  width: 50%;
`;

export { StyledEmptySubTitle as AnimatedPlaceholderEmptySubTitle };
