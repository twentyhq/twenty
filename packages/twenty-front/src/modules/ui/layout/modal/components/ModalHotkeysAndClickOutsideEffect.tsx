import { DIALOG_CLICK_OUTSIDE_ID } from '@/ui/feedback/dialog-manager/constants/DialogClickOutsideId';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
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
  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: () => {
      onEnter?.();
    },
    focusId: modalId,
    dependencies: [onEnter],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
    focusId: modalId,
    dependencies: [isClosable, onClose],
  });

  useListenClickOutside({
    refs: [modalRef],
    excludedClickOutsideIds: [
      MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID,
      DIALOG_CLICK_OUTSIDE_ID,
    ],
    listenerId: `MODAL_CLICK_OUTSIDE_LISTENER_ID_${modalId}`,
    callback: () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
  });

  return null;
};
