import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { IconComponent } from 'twenty-ui';

import { ANIMATION_DIV_PROPS } from '@/object-record/record-table/constants/AnimationDivProps';
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
    initial={ANIMATION_DIV_PROPS.initial}
    animate={ANIMATION_DIV_PROPS.animate}
    transition={ANIMATION_DIV_PROPS.transition}
    whileHover={ANIMATION_DIV_PROPS.whileHover}
  >
    <FloatingIconButton size="small" onClick={onClick} Icon={Icon} />
  </StyledEditButtonContainer>
);
