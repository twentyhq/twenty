import styled from '@emotion/styled';
import { IconPencil } from '@tabler/icons-react';
import { motion } from 'framer-motion';

import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';

const StyledEditButtonContainer = styled(motion.div)`
  position: absolute;
  right: 5px;
`;

type EditableCellEditButtonProps = {
  onClick?: () => void;
};

export function EditableCellEditButton({
  onClick,
}: EditableCellEditButtonProps) {
  return (
    <StyledEditButtonContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      whileHover={{ scale: 1.04 }}
    >
      <FloatingIconButton size="small" onClick={onClick} Icon={IconPencil} />
    </StyledEditButtonContainer>
  );
}
