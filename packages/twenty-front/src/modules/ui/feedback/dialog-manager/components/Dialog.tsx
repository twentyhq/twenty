import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { Key } from 'ts-key-enum';

import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { Button } from 'twenty-ui';
import { isDefined } from '~/utils/isDefined';

import { DialogHotkeyScope } from '../types/DialogHotkeyScope';

const StyledDialogOverlay = styled(motion.div)`
  align-items: center;
  background: ${({ theme }) => theme.background.overlayPrimary};
  display: flex;
  height: 100dvh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 9999;
`;

const StyledDialogContainer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-width: 320px;
  padding: 2em;
  position: relative;
  width: 100%;
`;

const StyledDialogTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

const StyledDialogMessage = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

const StyledDialogButton = styled(Button)`
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
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
  allowDismiss?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClose?: () => void;
};

export const Dialog = ({
  title,
  message,
  buttons = [],
  allowDismiss = true,
  children,
  className,
  onClose,
  id,
}: DialogProps) => {
  const closeSnackbar = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const dialogVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  const containerVariants = {
    open: { y: 0 },
    closed: { y: '50vh' },
  };

  useScopedHotkeys(
    Key.Enter,
    (event: KeyboardEvent) => {
      const confirmButton = buttons.find((button) => button.role === 'confirm');

      event.preventDefault();

      if (isDefined(confirmButton)) {
        confirmButton?.onClick?.(event);
        closeSnackbar();
      }
    },
    DialogHotkeyScope.Dialog,
    [],
  );

  useScopedHotkeys(
    Key.Escape,
    (event: KeyboardEvent) => {
      event.preventDefault();
      closeSnackbar();
    },
    DialogHotkeyScope.Dialog,
    [],
  );

  return (
    <StyledDialogOverlay
      variants={dialogVariants}
      initial="closed"
      animate="open"
      exit="closed"
      onClick={(e) => {
        if (allowDismiss) {
          e.stopPropagation();
          closeSnackbar();
        }
      }}
      className={className}
    >
      <StyledDialogContainer
        variants={containerVariants}
        transition={{ damping: 15, stiffness: 100 }}
        id={id}
      >
        {title && <StyledDialogTitle>{title}</StyledDialogTitle>}
        {message && <StyledDialogMessage>{message}</StyledDialogMessage>}
        {children}
        {buttons.map(({ accent, onClick, role, title: key, variant }) => (
          <StyledDialogButton
            onClick={(event) => {
              onClick?.(event);
              closeSnackbar();
            }}
            fullWidth={true}
            variant={variant ?? 'secondary'}
            title={key}
            {...{ accent, key, role }}
          />
        ))}
      </StyledDialogContainer>
    </StyledDialogOverlay>
  );
};
