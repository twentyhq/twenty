import { useCallback } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { Button, ButtonVariant } from '@/ui/button/components/Button';

const DialogOverlay = styled(motion.div)`
  align-items: center;
  background: ${({ theme }) => theme.background.overlay};
  display: flex;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 9999;
`;

const DialogContainer = styled(motion.div)`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  max-width: 320px;
  padding: 2em;
  position: relative;
  width: 100%;
`;

const DialogTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

const DialogMessage = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

const DialogButton = styled(Button)`
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

export type DialogButtonOptions = Omit<
  React.ComponentProps<typeof Button>,
  'fullWidth'
>;

export type DialogProps = React.ComponentPropsWithoutRef<typeof motion.div> & {
  title?: string;
  message?: string;
  buttons?: DialogButtonOptions[];
  allowDismiss?: boolean;
  children?: React.ReactNode;
  onClose?: () => void;
};

export function Dialog({
  title,
  message,
  buttons = [],
  allowDismiss = true,
  children,
  onClose,
  ...rootProps
}: DialogProps) {
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

  return (
    <DialogOverlay
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
    >
      <DialogContainer
        variants={containerVariants}
        transition={{ damping: 15, stiffness: 100 }}
        {...rootProps}
      >
        {title && <DialogTitle>{title}</DialogTitle>}
        {message && <DialogMessage>{message}</DialogMessage>}
        {children}
        {buttons.map((button) => (
          <DialogButton
            key={button.title}
            onClick={(e) => {
              button?.onClick?.(e);
              closeSnackbar();
            }}
            fullWidth={true}
            variant={button.variant ?? ButtonVariant.Secondary}
            {...button}
          />
        ))}
      </DialogContainer>
    </DialogOverlay>
  );
}
