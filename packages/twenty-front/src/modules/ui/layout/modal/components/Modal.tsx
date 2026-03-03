import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { ModalHotkeysAndClickOutsideEffect } from '@/ui/layout/modal/components/ModalHotkeysAndClickOutsideEffect';
import { ModalComponentInstanceContext } from '@/ui/layout/modal/contexts/ModalComponentInstanceContext';
import { useModalContainer } from '@/ui/layout/modal/contexts/ModalContainerContext';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';

import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { css } from '@linaria/core';
import { ThemeContext } from 'twenty-ui/theme';
const StyledModalDivBase = styled.div<{
  size?: ModalSize;
  padding?: ModalPadding;
  isMobile: boolean;
  modalVariant: ModalVariants;
}>`
  display: flex;
  flex-direction: column;
  box-shadow: ${({ modalVariant }) =>
    modalVariant === 'primary'
      ? themeCssVariables.boxShadow.superHeavy
      : modalVariant === 'transparent'
        ? 'none'
        : themeCssVariables.boxShadow.strong};
  background: ${({ modalVariant }) =>
    modalVariant === 'transparent'
      ? 'transparent'
      : themeCssVariables.background.primary};
  color: ${themeCssVariables.font.color.primary};
  border-radius: ${({ isMobile, modalVariant }) => {
    if (isMobile || modalVariant === 'transparent') return `0`;
    return themeCssVariables.border.radius.md;
  }};
  overflow-x: hidden;
  overflow-y: auto;
  z-index: ${RootStackingContextZIndices.RootModal}; // should be higher than Backdrop's z-index

  width: ${({ isMobile, size }) => {
    if (isMobile)
      return themeCssVariables.modal.size.fullscreen.width ?? 'auto';
    switch (size) {
      case 'small':
        return themeCssVariables.modal.size.sm.width ?? 'auto';
      case 'medium':
        return themeCssVariables.modal.size.md.width ?? 'auto';
      case 'large':
        return themeCssVariables.modal.size.lg.width ?? 'auto';
      case 'extraLarge':
        return themeCssVariables.modal.size.xl.width ?? 'auto';
      default:
        return 'auto';
    }
  }};

  padding: ${({ padding }) => {
    switch (padding) {
      case 'none':
        return themeCssVariables.spacing[0];
      case 'small':
        return themeCssVariables.spacing[2];
      case 'medium':
        return themeCssVariables.spacing[4];
      case 'large':
        return themeCssVariables.spacing[6];
      default:
        return 'auto';
    }
  }};
  height: ${({ isMobile, size }) => {
    if (isMobile)
      return themeCssVariables.modal.size.fullscreen.height ?? 'auto';

    switch (size) {
      case 'extraLarge':
        return themeCssVariables.modal.size.xl.height ?? 'auto';
      default:
        return 'auto';
    }
  }};
  max-height: ${({ isMobile }) => (isMobile ? 'none' : '90dvh')};
`;
const StyledModalDiv = motion.create(StyledModalDivBase);

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledContent = styled.div<{
  isVerticalCentered?: boolean;
  isHorizontalCentered?: boolean;
}>`
  display: flex;
  flex: 1;
  flex: 1 1 0%;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[10]};
  ${({ isVerticalCentered }) =>
    isVerticalCentered
      ? css`
          align-items: center;
        `
      : ''}
  ${({ isHorizontalCentered }) =>
    isHorizontalCentered
      ? css`
          justify-content: center;
        `
      : ''}
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[5]};
`;

const StyledBackDropBase = styled.div<{
  modalVariant: ModalVariants;
  isInContainer?: boolean;
}>`
  align-items: center;
  background: ${({ modalVariant, isInContainer }) =>
    isInContainer
      ? themeCssVariables.background.overlayTertiary
      : modalVariant === 'primary' || modalVariant === 'transparent'
        ? themeCssVariables.background.overlayPrimary
        : modalVariant === 'secondary'
          ? themeCssVariables.background.overlaySecondary
          : themeCssVariables.background.overlayTertiary};
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  pointer-events: auto;
  position: ${({ isInContainer }) => (isInContainer ? 'absolute' : 'fixed')};
  top: 0;
  width: 100%;
  z-index: ${RootStackingContextZIndices.RootModalBackDrop};
  user-select: none;
`;
const StyledBackDrop = motion.create(StyledBackDropBase);

type ModalHeaderProps = React.PropsWithChildren & {
  className?: string;
};

const ModalHeader = ({ children, className }: ModalHeaderProps) => (
  <StyledHeader className={className}>{children}</StyledHeader>
);

type ModalContentProps = React.PropsWithChildren & {
  className?: string;
  isVerticalCentered?: boolean;
  isHorizontalCentered?: boolean;
};

const ModalContent = ({
  children,
  className,
  isVerticalCentered,
  isHorizontalCentered,
}: ModalContentProps) => (
  <StyledContent
    className={className}
    isVerticalCentered={isVerticalCentered}
    isHorizontalCentered={isHorizontalCentered}
  >
    {children}
  </StyledContent>
);
type ModalFooterProps = React.PropsWithChildren & {
  className?: string;
};

const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <StyledFooter className={className}>{children}</StyledFooter>
);

export type ModalSize = 'small' | 'medium' | 'large' | 'extraLarge';
export type ModalPadding = 'none' | 'small' | 'medium' | 'large';
export type ModalVariants =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'transparent';

export type ModalProps = React.PropsWithChildren & {
  modalId: string;
  size?: ModalSize;
  padding?: ModalPadding;
  className?: string;
  onEnter?: () => void;
  modalVariant?: ModalVariants;
  dataGloballyPreventClickOutside?: boolean;
  shouldCloseModalOnClickOutsideOrEscape?: boolean;
  ignoreContainer?: boolean;
} & (
    | { isClosable: true; onClose?: () => void }
    | { isClosable?: false; onClose?: never }
  );

const modalAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const Modal = ({
  modalId,
  children,
  size = 'medium',
  padding = 'medium',
  className,
  onEnter,
  isClosable = false,
  onClose,
  modalVariant = 'primary',
  dataGloballyPreventClickOutside = false,
  shouldCloseModalOnClickOutsideOrEscape = true,
  ignoreContainer = false,
}: ModalProps) => {
  const isMobile = useIsMobile();
  const modalRef = useRef<HTMLDivElement>(null);
  const { container } = useModalContainer();
  const effectiveContainer = ignoreContainer
    ? isDefined(document)
      ? document.body
      : null
    : container;
  const isInContainer = isDefined(container) && !ignoreContainer;

  const { theme } = useContext(ThemeContext);

  const stopEventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isModalOpened = useAtomComponentStateValue(
    isModalOpenedComponentState,
    modalId,
  );

  const { closeModal } = useModal();

  const handleClose = () => {
    onClose?.();
    if (shouldCloseModalOnClickOutsideOrEscape) closeModal(modalId);
  };

  const modalContent = (
    <AnimatePresence mode="wait">
      {isModalOpened && (
        <ModalComponentInstanceContext.Provider
          value={{
            instanceId: modalId,
          }}
        >
          <ClickOutsideListenerContext.Provider
            value={{
              excludedClickOutsideId: MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID,
            }}
          >
            <ModalHotkeysAndClickOutsideEffect
              modalId={modalId}
              modalRef={modalRef}
              onEnter={onEnter}
              isClosable={isClosable}
              onClose={handleClose}
            />
            <StyledBackDrop
              data-testid="modal-backdrop"
              data-click-outside-id={MODAL_BACKDROP_CLICK_OUTSIDE_ID}
              onMouseDown={stopEventPropagation}
              modalVariant={modalVariant}
              isInContainer={isInContainer}
            >
              <StyledModalDiv
                ref={modalRef}
                size={size}
                padding={padding}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                modalVariant={modalVariant}
                variants={modalAnimation}
                transition={{ duration: theme.animation.duration.normal }}
                className={className}
                isMobile={isMobile}
                data-globally-prevent-click-outside={
                  dataGloballyPreventClickOutside
                }
              >
                {children}
              </StyledModalDiv>
            </StyledBackDrop>
          </ClickOutsideListenerContext.Provider>
        </ModalComponentInstanceContext.Provider>
      )}
    </AnimatePresence>
  );

  if (isDefined(effectiveContainer)) {
    return createPortal(modalContent, effectiveContainer);
  }

  return modalContent;
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
Modal.Backdrop = StyledBackDrop;
