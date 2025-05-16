import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import {
  ClickOutsideMode,
  useListenClickOutside,
} from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { Key } from 'ts-key-enum';

type ModalHotkeysAndClickOutsideEffectProps = {
  modalRef: React.RefObject<HTMLDivElement>;
  onEnter?: () => void;
  isClosable?: boolean;
  onClose?: () => void;
  modalId: string;
};

export const ModalHotkeysAndClickOutsideEffect = ({
  modalRef,
  onEnter,
  isClosable = false,
  onClose,
  modalId,
}: ModalHotkeysAndClickOutsideEffectProps) => {
  useScopedHotkeys(
    [Key.Enter],
    () => {
      onEnter?.();
    },
    ModalHotkeyScope.ModalFocus,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
    ModalHotkeyScope.ModalFocus,
  );

  useListenClickOutside({
    refs: [modalRef],
    listenerId: `MODAL_CLICK_OUTSIDE_LISTENER_ID_${modalId}`,
    callback: () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
    mode: ClickOutsideMode.compareHTMLRef,
  });

  return null;
};
