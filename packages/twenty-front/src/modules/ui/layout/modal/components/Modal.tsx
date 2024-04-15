import React, { useEffect } from 'react';
import { Key } from 'ts-key-enum';

import {
  ModalPadding,
  ModalSize,
  UIModal,
} from '@/ui/layout/modal/components/UIModal';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { ModalHotkeyScope } from './types/ModalHotkeyScope';

type ModalProps = React.PropsWithChildren & {
  isOpen?: boolean;
  onClose?: () => void;
  hotkeyScope?: ModalHotkeyScope;
  onEnter?: () => void;
  size?: ModalSize;
  padding?: ModalPadding;
  className?: string;
};

export const Modal = ({
  isOpen = false,
  children,
  onClose,
  hotkeyScope = ModalHotkeyScope.Default,
  onEnter,
  size = 'medium',
  padding = 'medium',
  className,
}: ModalProps) => {
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

  return (
    <UIModal
      isOpen={isOpen}
      onClose={onClose}
      onEnter={onEnter}
      className={className}
      size={size}
      padding={padding}
    >
      {children}
    </UIModal>
  );
};

Modal.Header = UIModal.Header;
Modal.Content = UIModal.Content;
Modal.Footer = UIModal.Footer;
