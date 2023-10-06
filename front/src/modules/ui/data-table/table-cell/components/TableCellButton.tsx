import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { FloatingIconButton } from '@/ui/button/components/FloatingIconButton';
import { IconComponent } from '@/ui/icon/types/IconComponent';

const StyledEditButtonContainer = styled(motion.div)`
  position: absolute;
  right: 5px;
`;

type TableCellButtonProps = {
  onClick?: () => void;
  Icon: IconComponent;
};

export const TableCellButton = ({ onClick, Icon }: TableCellButtonProps) => (
  <StyledEditButtonContainer
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.1 }}
    whileHover={{ scale: 1.04 }}
  >
    <FloatingIconButton size="small" onClick={onClick} Icon={Icon} />
  </StyledEditButtonContainer>
);
