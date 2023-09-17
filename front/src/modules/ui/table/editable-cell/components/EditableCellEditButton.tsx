import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconPencil } from '@/ui/icon';

const StyledEditButtonContainer = styled(motion.div)`
  position: absolute;
  right: 5px;
`;

type EditableCellEditButtonProps = {
  onClick?: () => void;
};

export const EditableCellEditButton = ({
  onClick,
}: EditableCellEditButtonProps) => (
  <StyledEditButtonContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.1 }}
    whileHover={{ scale: 1.04 }}
  >
    <FloatingIconButton size="small" onClick={onClick} Icon={IconPencil} />
  </StyledEditButtonContainer>
);
