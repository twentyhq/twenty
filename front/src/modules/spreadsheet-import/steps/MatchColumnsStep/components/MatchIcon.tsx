import { dataAttr } from '@chakra-ui/utils';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { IconCheck } from '@/ui/icon';

const Container = styled.div`
  height: 6px;
  margin-left: ${({ theme }) => theme.spacing(1)};
  margin-right: ${({ theme }) => theme.spacing(1)};
  min-height: 6px;
  min-width: 6px;
  width: 6px;
`;

const Flex = styled.div`
  display: flex;
`;

const MotionFlex = motion(Flex);

const animationConfig = {
  transition: {
    duration: 0.1,
  },
  exit: { scale: 0.5, opacity: 0 },
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
};

type MatchIconProps = {
  isChecked: boolean;
};

export const MatchIcon = (props: MatchIconProps) => {
  return (
    <Container
      data-highlighted={dataAttr(props.isChecked)}
      data-testid="column-checkmark"
    >
      {props.isChecked && (
        <MotionFlex {...animationConfig}>
          <IconCheck size={16} />
        </MotionFlex>
      )}
    </Container>
  );
};
