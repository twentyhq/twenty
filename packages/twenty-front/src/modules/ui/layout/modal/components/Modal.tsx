import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { ModalHotkeysAndClickOutsideEffect } from '@/ui/layout/modal/components/ModalHotkeysAndClickOutsideEffect';
import { ModalComponentInstanceContext } from '@/ui/layout/modal/contexts/ModalComponentInstanceContext';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';

import { MODAL_BACKDROP_CLICK_OUTSIDE_ID } from '@/ui/layout/modal/constants/ModalBackdropClickOutsideId';
import { MODAL_CLICK_OUTSIDE_LISTENER_EXCLUDED_ID } from '@/ui/layout/modal/constants/ModalClickOutsideListenerExcludedClassName';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useRef } from 'react';
const StyledModalDiv = styled(motion.div)<{
  size?: ModalSize;
  padding?: ModalPadding;
  isMobile: boolean;
  modalVariant: ModalVariants;
}>`
  display: flex;
  flex-direction: column;
  box-shadow: ${({ theme, modalVariant }) =>
    modalVariant === 'primary'
      ? theme.boxShadow.superHeavy
      : modalVariant === 'transparent'
        ? 'none'
        : theme.boxShadow.strong};
  background: ${({ theme, modalVariant }) =>
    modalVariant === 'transparent' ? 'transparent' : theme.background.primary};
  color: ${({ theme }) => theme.font.color.primary};
  border-radius: ${({ theme, isMobile, modalVariant }) => {
    if (isMobile || modalVariant === 'transparent') return `0`;
    return theme.border.radius.md;
  }};
  overflow-x: hidden;
  overflow-y: auto;
  z-index: ${RootStackingContextZIndices.RootModal}; // should be higher than Backdrop's z-index

  width: ${({ isMobile, size, theme }) => {
    if (isMobile) return theme.modal.size.fullscreen.width;
    switch (size) {
      case 'small':
        return theme.modal.size.sm.width;
      case 'medium':
        return theme.modal.size.md.width;
      case 'large':
        return theme.modal.size.lg.width;
      case 'extraLarge':
        return theme.modal.size.xl.width;
      default:
        return 'auto';
    }
  }};

  padding: ${({ padding, theme }) => {
    switch (padding) {
      case 'none':
        return theme.spacing(0);
      case 'small':
        return theme.spacing(2);
      case 'medium':
        return theme.spacing(4);
      case 'large':
        return theme.spacing(6);
      default:
        return 'auto';
    }
  }};
  height: ${({ isMobile, theme, size }) => {
    if (isMobile) return theme.modal.size.fullscreen.height;

    switch (size) {
      case 'extraLarge':
        return theme.modal.size.xl.height;
      default:
        return 'auto';
    }
  }};
  max-height: ${({ isMobile }) => (isMobile ? 'none' : '90dvh')};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(5)};
`;

const StyledContent = styled.div<{
  isVerticalCentered?: boolean;
  isHorizontalCentered?: boolean;
}>`
  display: flex;
  flex: 1;
  flex: 1 1 0%;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(10)};
  ${({ isVerticalCentered }) =>
    isVerticalCentered &&
    css`
      align-items: center;
    `}
  ${({ isHorizontalCentered }) =>
    isHorizontalCentered &&
    css`
      justify-content: center;
    `}
`;

const StyledFooter = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 60px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(5)};
`;

const StyledBackDrop = styled(motion.div)<{
  modalVariant: ModalVariants;
}>`
  align-items: center;
  background: ${({ theme, modalVariant }) =>
    modalVariant === 'primary' || modalVariant === 'transparent'
      ? theme.background.overlayPrimary
      : modalVariant === 'secondary'
        ? theme.background.overlaySecondary
        : theme.background.overlayTertiary};
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: ${RootStackingContextZIndices.RootModalBackDrop};
  user-select: none;
`;

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
}: ModalProps) => {
  const isMobile = useIsMobile();
  const modalRef = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const stopEventPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    modalId,
  );

  const { closeModal } = useModal();

  const handleClose = () => {
    onClose?.();
    if (shouldCloseModalOnClickOutsideOrEscape) closeModal(modalId);
  };

  return (
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
};

Modal.Header = ModalHeader;
Modal.Content = ModalContent;
Modal.Footer = ModalFooter;
Modal.Backdrop = StyledBackDrop;
