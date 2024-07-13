import { useEffect, useRef } from 'react';
import { Key } from 'ts-key-enum';

import {
  ModalLayout,
  ModalLayoutProps,
} from '@/ui/layout/modal/components/ModalLayout';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

import { useListenClickOutsideV2 } from '@/ui/utilities/pointer-event/hooks/useListenClickOutsideV2';
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

  useListenClickOutsideV2({
    refs: [modalRef],
    listenerId: 'MODAL_CLICK_OUTSIDE_LISTENER_ID',
    callback: () => onClose?.(),
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
