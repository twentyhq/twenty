import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { IconComponent } from 'twenty-ui';

import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';

const StyledEditButtonContainer = styled(motion.div)`
  margin: ${({ theme }) => theme.spacing(1)};
`;

type RecordTableCellButtonProps = {
  onClick?: () => void;
  Icon: IconComponent;
};

export const AnimationDivProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.1 },
  whileHover: { scale: 1.04 },
};

export const RecordTableCellButton = ({
  onClick,
  Icon,
}: RecordTableCellButtonProps) => (
  <StyledEditButtonContainer
    initial={AnimationDivProps.initial}
    animate={AnimationDivProps.animate}
    transition={AnimationDivProps.transition}
    whileHover={AnimationDivProps.whileHover}
  >
    <FloatingIconButton size="small" onClick={onClick} Icon={Icon} />
  </StyledEditButtonContainer>
);
