import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Key } from 'ts-key-enum';

type ModalHotkeysAndClickOutsideEffectProps = {
  modalRef: React.RefObject<HTMLDivElement>;
  modalId: string;
  hotkeyScope: ModalHotkeyScope;
  onEnter?: () => void;
  isClosable?: boolean;
  onClose?: () => void;
};

export const ModalHotkeysAndClickOutsideEffect = ({
  modalRef,
  hotkeyScope = ModalHotkeyScope.ModalFocus,
  onEnter,
  isClosable = false,
  onClose,
}: ModalHotkeysAndClickOutsideEffectProps) => {
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

  return null;
};
