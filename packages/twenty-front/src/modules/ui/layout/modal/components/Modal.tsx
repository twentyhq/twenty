import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { Key } from 'ts-key-enum';

const StyledModalDiv = styled(motion.div)<{
  size?: ModalSize;
  padding?: ModalPadding;
  isMobile: boolean;
  modalVariant: ModalVariants;
}>`
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme, modalVariant }) =>
    modalVariant === 'primary'
      ? theme.boxShadow.superHeavy
      : theme.boxShadow.strong};
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  border-radius: ${({ theme, isMobile }) => {
    if (isMobile) return `0`;
    return theme.border.radius.md;
  }};
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 10000; // should be higher than Backdrop's z-index

  width: ${({ isMobile, size, theme }) => {
    if (isMobile) return theme.modal.size.fullscreen;
    switch (size) {
      case 'small':
        return theme.modal.size.sm;
      case 'medium':
        return theme.modal.size.md;
      case 'large':
        return theme.modal.size.lg;
      default:
        return 'auto';
    }
  }};

  padding: ${({ padding, theme }) => {
    switch (padding) {
      case 'none':
        return theme.spacing(0);
      case 'small':
        return theme.spacing(2);
      case 'medium':
        return theme.spacing(4);
      case 'large':
        return theme.spacing(6);
      default:
        return 'auto';
    }
  }};
  height: ${({ isMobile, theme }) =>
    isMobile ? theme.modal.size.fullscreen : 'auto'};
  max-height: ${({ isMobile }) => (isMobile ? 'none' : '90dvh')};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(5)};
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex: 1 1 0%;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(10)};
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(5)};
`;

const StyledBackDrop = styled(motion.div)<{
  modalVariant: ModalVariants;
}>`
  align-items: center;
  background: ${({ theme, modalVariant }) =>
    modalVariant === 'primary'
      ? theme.background.overlayPrimary
      : modalVariant === 'secondary'
        ? theme.background.overlaySecondary
        : theme.background.overlayTertiary};
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 9999;
  user-select: none;
`;

type ModalHeaderProps = React.PropsWithChildren & {
  className?: string;
};

const ModalHeader = ({ children, className }: ModalHeaderProps) => (
  <StyledHeader className={className}>{children}</StyledHeader>
);

type ModalContentProps = React.PropsWithChildren & {
  className?: string;
};

const ModalContent = ({ children, className }: ModalContentProps) => (
  <StyledContent className={className}>{children}</StyledContent>
);

type ModalFooterProps = React.PropsWithChildren & {
  className?: string;
};

const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <StyledFooter className={className}>{children}</StyledFooter>
);

export type ModalSize = 'small' | 'medium' | 'large';
export type ModalPadding = 'none' | 'small' | 'medium' | 'large';
export type ModalVariants = 'primary' | 'secondary' | 'tertiary';

export type ModalProps = React.PropsWithChildren & {
  size?: ModalSize;
  padding?: ModalPadding;
  className?: string;
  hotkeyScope?: ModalHotkeyScope;
  onEnter?: () => void;
  modalVariant?: ModalVariants;
} & (
    | { isClosable: true; onClose: () => void }
    | { isClosable?: false; onClose?: never }
  );

const modalAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const Modal = ({
  children,
  size = 'medium',
  padding = 'medium',
  className,
  hotkeyScope = ModalHotkeyScope.Default,
  onEnter,
  isClosable = false,
  onClose,
  modalVariant = 'primary',
}: ModalProps) => {
  const isMobile = useIsMobile();
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  useEffect(() => {
    setHotkeyScopeAndMemorizePreviousScope(hotkeyScope);
    return () => {
      goBackToPreviousHotkeyScope();
    };
  }, [
    hotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  ]);

  useScopedHotkeys(
    [Key.Enter],
    () => {
      onEnter?.();
    },
    hotkeyScope,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
    hotkeyScope,
  );

  useListenClickOutside({
    refs: [modalRef],
    listenerId: 'MODAL_CLICK_OUTSIDE_LISTENER_ID',
    callback: () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
    mode: ClickOutsideMode.comparePixels,
  });

  const stopEventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <StyledBackDrop
      className="modal-backdrop"
      onMouseDown={stopEventPropagation}
      modalVariant={modalVariant}
    >
      <StyledModalDiv
        ref={modalRef}
        size={size}
        padding={padding}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        modalVariant={modalVariant}
        variants={modalAnimation}
        className={className}
        isMobile={isMobile}
      >
        {children}
      </StyledModalDiv>
    </StyledBackDrop>
  );
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
