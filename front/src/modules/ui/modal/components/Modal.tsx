import React, { useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const ModalDiv = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  max-height: 90vh;
  z-index: 10000; // should be higher than Backdrop's z-index
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(5)};
`;

const StyledContent = styled.div`
  display: block;
  flex-direction: column;
  height: 100%;
  max-height: 30vh;
  overflow: scroll;
  padding: ${({ theme }) => theme.spacing(10)};
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(5)};
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

/**
 * Modal components
 */
type ModalHeaderProps = React.PropsWithChildren & React.ComponentProps<'div'>;

function ModalHeader({ children, ...restProps }: ModalHeaderProps) {
  return <StyledHeader {...restProps}>{children}</StyledHeader>;
}

type ModalContentProps = React.PropsWithChildren & React.ComponentProps<'div'>;

function ModalContent({ children, ...restProps }: ModalContentProps) {
  return <StyledContent {...restProps}>{children}</StyledContent>;
}

type ModalFooterProps = React.PropsWithChildren & React.ComponentProps<'div'>;

function ModalFooter({ children, ...restProps }: ModalFooterProps) {
  return <StyledFooter {...restProps}>{children}</StyledFooter>;
}

/**
 * Modal
 */
type ModalProps = React.PropsWithChildren &
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
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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
        // framer-motion seems to have typing problems with refs
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={modalRef}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        variants={modalVariants}
        {...restProps}
      >
        {children}
      </ModalDiv>
    </BackDrop>
  );
}

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
