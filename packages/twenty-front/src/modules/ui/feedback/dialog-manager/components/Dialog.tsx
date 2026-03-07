import { styled } from '@linaria/react';
import { motion } from 'framer-motion';
import { Key } from 'ts-key-enum';

import { DIALOG_CLICK_OUTSIDE_ID } from '@/ui/feedback/dialog-manager/constants/DialogClickOutsideId';
import { DIALOG_FOCUS_ID } from '@/ui/feedback/dialog-manager/constants/DialogFocusId';
import { DIALOG_LISTENER_ID } from '@/ui/feedback/dialog-manager/constants/DialogListenerId';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDialogOverlayBase = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.overlayPrimary};
  display: flex;
  height: 100dvh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: ${RootStackingContextZIndices.Dialog};
`;
const StyledDialogOverlay = motion.create(StyledDialogOverlayBase);

const StyledDialogContainerBase = styled.div`
  background: ${themeCssVariables.background.primary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-width: 320px;
  padding: 2em;
  position: relative;
  width: 100%;
`;
const StyledDialogContainer = motion.create(StyledDialogContainerBase);

const StyledDialogTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledDialogMessage = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  margin-bottom: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const StyledDialogButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export type DialogButtonOptions = Omit<
  React.ComponentProps<typeof Button>,
  'fullWidth'
> & {
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent> | KeyboardEvent,
  ) => void;
  role?: 'confirm';
};

export type DialogProps = React.ComponentPropsWithoutRef<typeof motion.div> & {
  title?: string;
  message?: string;
  buttons?: DialogButtonOptions[];
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

export const Dialog = ({
  title,
  message,
  buttons = [],
  children,
  className,
  onClose,
  id,
}: DialogProps) => {
  const dialogVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  const containerVariants = {
    open: { y: 0 },
    closed: { y: '50vh' },
  };

  const handleEnter = (event: KeyboardEvent) => {
    const confirmButton = buttons.find((button) => button.role === 'confirm');

    event.preventDefault();

    if (isDefined(confirmButton)) {
      confirmButton?.onClick?.(event);
      onClose?.();
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    event.preventDefault();
    onClose?.();
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: handleEnter,
    focusId: DIALOG_FOCUS_ID,
    dependencies: [buttons],
  });

  useHotkeysOnFocusedElement({
    keys: [Key.Escape],
    callback: handleEscape,
    focusId: DIALOG_FOCUS_ID,
    dependencies: [handleEscape],
  });

  const dialogRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [dialogRef],
    callback: () => {
      onClose?.();
    },
    listenerId: DIALOG_LISTENER_ID,
  });

  return (
    <StyledDialogOverlay
      variants={dialogVariants}
      initial="closed"
      animate="open"
      exit="closed"
      className={className}
      data-click-outside-id={DIALOG_CLICK_OUTSIDE_ID}
    >
      <StyledDialogContainer
        variants={containerVariants}
        transition={{ damping: 15, stiffness: 100 }}
        id={id}
        ref={dialogRef}
      >
        {title && <StyledDialogTitle>{title}</StyledDialogTitle>}
        {message && <StyledDialogMessage>{message}</StyledDialogMessage>}
        {children}
        {buttons.map(({ accent, onClick, role, title: key, variant }) => (
          <StyledDialogButtonContainer key={key}>
            <Button
              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                onClose?.();
                onClick?.(event);
              }}
              fullWidth={true}
              variant={variant ?? 'secondary'}
              title={key}
              {...{ accent, role }}
            />
          </StyledDialogButtonContainer>
        ))}
      </StyledDialogContainer>
    </StyledDialogOverlay>
  );
};
