import { useHotkeysOnFocusedElement } from '@/ui/utilities/focus/hooks/useHotkeysOnFocusedElement';
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
  useHotkeysOnFocusedElement(
    [Key.Enter],
    () => {
      onEnter?.();
    },
    modalId,
  );

  useHotkeysOnFocusedElement(
    [Key.Escape],
    () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
    modalId,
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
