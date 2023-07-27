import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

const StyledContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(10)};
`;

const ModalDiv = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  z-index: 10000; // should be higher than Backdrop's z-index
`;

const BackDrop = styled(motion.div)`
  align-items: center;
  background: ${({ theme }) => theme.background.overlay};
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 9999;
`;

type Props = React.PropsWithChildren &
  React.ComponentProps<'div'> & {
    isOpen?: boolean;
  };

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function Modal({ isOpen = false, children, ...restProps }: Props) {
  if (!isOpen) {
    return null;
  }

  return (
    <>
      <BackDrop>
        <ModalDiv
          layout
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
        >
          <StyledContainer {...restProps}>{children}</StyledContainer>
        </ModalDiv>
      </BackDrop>
    </>
  );
}
