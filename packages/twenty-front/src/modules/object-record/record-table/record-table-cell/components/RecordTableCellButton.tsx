import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';

const StyledEditButtonContainer = styled(motion.div)`
  position: absolute;
  right: 5px;
`;

type RecordTableCellButtonProps = {
  onClick?: () => void;
  Icon: IconComponent;
};

export const RecordTableCellButton = ({
  onClick,
  Icon,
}: RecordTableCellButtonProps) => (
  <StyledEditButtonContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.1 }}
    whileHover={{ scale: 1.04 }}
  >
    <FloatingIconButton size="small" onClick={onClick} Icon={Icon} />
  </StyledEditButtonContainer>
);
