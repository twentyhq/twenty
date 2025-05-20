import { ModalHotkeyScope } from '@/ui/layout/modal/components/types/ModalHotkeyScope';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_CLASS_NAME } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/focus/hooks/useHotkeysOnFocusedElement';
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
  useHotkeysOnFocusedElement(
    [Key.Enter],
    () => {
      onEnter?.();
    },
    modalId,
    {
      scope: ModalHotkeyScope.ModalFocus,
    },
    [onEnter],
  );

  useHotkeysOnFocusedElement(
    [Key.Escape],
    () => {
      if (isClosable && onClose !== undefined) {
        onClose();
      }
    },
    modalId,
    {
      scope: ModalHotkeyScope.ModalFocus,
    },
    [isClosable, onClose],
  );

  useListenClickOutside({
    refs: [modalRef],
    excludeClassNames: [
      MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_CLASS_NAME,
      'dialog-manager-dialog',
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
