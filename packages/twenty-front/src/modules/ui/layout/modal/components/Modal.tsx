import React, { useEffect, useRef } from 'react';
import { Key } from 'ts-key-enum';

import {
  ModalLayout,
  ModalLayoutProps,
} from '@/ui/layout/modal/components/ModalLayout';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

import { ModalHotkeyScope } from './types/ModalHotkeyScope';

type ModalProps = ModalLayoutProps & {
  isOpen?: boolean;
  hotkeyScope?: ModalHotkeyScope;
  onClose?: () => void;
  onEnter?: () => void;
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

  return isOpen ? (
    <ModalLayout
      className={className}
      modalRef={modalRef}
      size={size}
      padding={padding}
    >
      {children}
    </ModalLayout>
  ) : (
    <></>
  );
};

Modal.Header = ModalLayout.Header;
Modal.Content = ModalLayout.Content;
Modal.Footer = ModalLayout.Footer;
