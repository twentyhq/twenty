import React, { useEffect, useRef } from 'react';
import { Key } from 'ts-key-enum';

import { UIModal, UIModalProps } from '@/ui/layout/modal/components/UIModal';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { ModalHotkeyScope } from './types/ModalHotkeyScope';

type ModalProps = UIModalProps & {
  onClose?: () => void;
  hotkeyScope?: ModalHotkeyScope;
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

  const modalRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [modalRef],
    callback: () => onClose?.(),
    mode: ClickOutsideMode.comparePixels,
  });

  return (
    <UIModal
      isOpen={isOpen}
      onEnter={onEnter}
      className={className}
      modalRef={modalRef}
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
