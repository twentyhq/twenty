import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { IconComponent } from 'twenty-ui';

import { AnimationDivProps } from '@/object-record/record-table/record-table-cell/components/RecordTableCellButton';
import { FloatingIconButton } from '@/ui/input/button/components/FloatingIconButton';

const StyledEditButtonContainer = styled(motion.div)`
  position: absolute;
  right: 5px;
`;

type RecordTableCellEditButtonProps = {
  onClick?: () => void;
  Icon: IconComponent;
};

export const RecordTableCellEditButton = ({
  onClick,
  Icon,
}: RecordTableCellEditButtonProps) => (
  <StyledEditButtonContainer
    initial={AnimationDivProps.initial}
    animate={AnimationDivProps.animate}
    transition={AnimationDivProps.transition}
    whileHover={AnimationDivProps.whileHover}
  >
    <FloatingIconButton size="small" onClick={onClick} Icon={Icon} />
  </StyledEditButtonContainer>
);
