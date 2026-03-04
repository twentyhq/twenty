import { ModalHotkeysAndClickOutsideEffect } from '@/ui/layout/modal/components/ModalHotkeysAndClickOutsideEffect';
import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { ModalComponentInstanceContext } from '@/ui/layout/modal/contexts/ModalComponentInstanceContext';
import { useModalContainer } from '@/ui/layout/modal/contexts/ModalContainerContext';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import React, { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  Modal,
  type ModalOverlay,
  type ModalPadding,
  type ModalSize,
} from 'twenty-ui/layout';

export type ModalStatefulWrapperProps = React.PropsWithChildren & {
  modalId: string;
  size?: ModalSize;
  padding?: ModalPadding;
  onEnter?: () => void;
  overlay?: ModalOverlay;
  dataGloballyPreventClickOutside?: boolean;
  shouldCloseModalOnClickOutsideOrEscape?: boolean;
  ignoreContainer?: boolean;
  gap?: number;
  smallBorderRadius?: boolean;
  narrowWidth?: boolean;
  autoHeight?: boolean;
} & (
    | { isClosable: true; onClose?: () => void }
    | { isClosable?: false; onClose?: never }
  );

export const ModalStatefulWrapper = ({
  modalId,
  children,
  size = 'medium',
  padding = 'medium',
  onEnter,
  isClosable = false,
  onClose,
  overlay = 'dark',
  dataGloballyPreventClickOutside = false,
  shouldCloseModalOnClickOutsideOrEscape = true,
  ignoreContainer = false,
  gap,
  smallBorderRadius,
  narrowWidth,
  autoHeight,
}: ModalStatefulWrapperProps) => {
  const isMobile = useIsMobile();
  const modalRef = useRef<HTMLDivElement>(null);
  const { container } = useModalContainer();

  const effectiveContainer = ignoreContainer
    ? isDefined(document)
      ? document.body
      : null
    : container;
  const isInContainer = isDefined(container) && !ignoreContainer;

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );

  const { closeModal } = useModal();

  const handleClose = () => {
    onClose?.();
    if (shouldCloseModalOnClickOutsideOrEscape) closeModal(modalId);
  };

  return (
    <ModalComponentInstanceContext.Provider value={{ instanceId: modalId }}>
      <ClickOutsideListenerContext.Provider
        value={{
          excludedClickOutsideId: MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID,
        }}
      >
        {isModalOpened && (
          <ModalHotkeysAndClickOutsideEffect
            modalId={modalId}
            modalRef={modalRef}
            onEnter={onEnter}
            isClosable={isClosable}
            onClose={handleClose}
          />
        )}
        <Modal
          isOpen={isModalOpened}
          onClose={handleClose}
          size={size}
          padding={padding}
          overlay={isInContainer ? 'light' : overlay}
          isMobile={isMobile}
          isInContainer={isInContainer}
          container={effectiveContainer}
          gap={gap}
          smallBorderRadius={smallBorderRadius}
          narrowWidth={narrowWidth}
          autoHeight={autoHeight}
          modalZIndex={RootStackingContextZIndices.RootModal}
          backdropZIndex={RootStackingContextZIndices.RootModalBackDrop}
          backdropClickOutsideId={MODAL_BACKDROP_CLICK_OUTSIDE_ID}
          preventClickOutside={dataGloballyPreventClickOutside}
          modalRef={modalRef}
        >
          {children}
        </Modal>
      </ClickOutsideListenerContext.Provider>
    </ModalComponentInstanceContext.Provider>
  );
};
