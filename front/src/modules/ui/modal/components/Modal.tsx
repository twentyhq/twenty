import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(10)};
  width: calc(400px - ${({ theme }) => theme.spacing(10 * 2)});
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
    onOutsideClick?: () => void;
  };

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export function Modal({
  isOpen = false,
  children,
  onOutsideClick,
  ...restProps
}: Props) {
  const modalRef = useRef(null);

  useListenClickOutside({
    refs: [modalRef],
    callback: () => onOutsideClick?.(),
    mode: ClickOutsideMode.absolute,
  });

  if (!isOpen) {
    return null;
  }

  return (
    <BackDrop>
      <ModalDiv
        layout
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        ref={modalRef}
      >
        <StyledContainer {...restProps}>{children}</StyledContainer>
      </ModalDiv>
    </BackDrop>
  );
}
