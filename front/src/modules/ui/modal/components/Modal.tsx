import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Key } from 'ts-key-enum';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { ModalHotkeyScope } from './types/ModalHotkeyScope';

const StyledModalDiv = styled(motion.div)<{
  size?: ModalSize;
  padding?: ModalPadding;
}>`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  overflow: hidden;
  max-height: 90vh;
  z-index: 10000; // should be higher than Backdrop's z-index

  width: ${({ size, theme }) => {
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
  flex-direction: column;
  overflow-y: auto;
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

const StyledBackDrop = styled(motion.div)`
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

const ModalHeader = ({ children, ...restProps }: ModalHeaderProps) => (
  <StyledHeader {...restProps}>{children}</StyledHeader>
);

type ModalContentProps = React.PropsWithChildren & React.ComponentProps<'div'>;

const ModalContent = ({ children, ...restProps }: ModalContentProps) => (
  <StyledContent {...restProps}>{children}</StyledContent>
);

type ModalFooterProps = React.PropsWithChildren & React.ComponentProps<'div'>;

const ModalFooter = ({ children, ...restProps }: ModalFooterProps) => (
  <StyledFooter {...restProps}>{children}</StyledFooter>
);

/**
 * Modal
 */
export type ModalSize = 'small' | 'medium' | 'large';
export type ModalPadding = 'none' | 'small' | 'medium' | 'large';

type ModalProps = React.PropsWithChildren &
  React.ComponentProps<'div'> & {
    isOpen?: boolean;
    onClose?: () => void;
    hotkeyScope?: ModalHotkeyScope;
    onEnter?: () => void;
    size?: ModalSize;
    padding?: ModalPadding;
  };

const modalVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const Modal = ({
  isOpen = false,
  children,
  onClose,
  hotkeyScope = ModalHotkeyScope.Default,
  onEnter,
  size = 'medium',
  padding = 'medium',
  ...restProps
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [modalRef],
    callback: () => onClose?.(),
    mode: ClickOutsideMode.absolute,
  });

  const {
    goBackToPreviousHotkeyScope,
    setHotkeyScopeAndMemorizePreviousScope,
  } = usePreviousHotkeyScope();

  useScopedHotkeys(
    [Key.Escape],
    () => {
      onClose?.();
    },
    hotkeyScope,
    [onClose],
  );

  useScopedHotkeys(
    [Key.Enter],
    () => {
      onEnter?.();
    },
    hotkeyScope,
  );

  useEffect(() => {
    if (isOpen) {
      setHotkeyScopeAndMemorizePreviousScope(hotkeyScope);
    } else {
      goBackToPreviousHotkeyScope();
    }
  }, [
    goBackToPreviousHotkeyScope,
    hotkeyScope,
    isOpen,
    setHotkeyScopeAndMemorizePreviousScope,
  ]);

  return isOpen ? (
    <StyledBackDrop>
      <StyledModalDiv
        // framer-motion seems to have typing problems with refs
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={modalRef}
        size={size}
        padding={padding}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        variants={modalVariants}
        {...restProps}
      >
        {children}
      </StyledModalDiv>
    </StyledBackDrop>
  ) : (
    <></>
  );
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
