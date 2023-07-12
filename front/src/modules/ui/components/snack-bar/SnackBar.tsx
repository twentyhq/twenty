import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { IconX } from '@/ui/icons';
import { rgba } from '@/ui/themes/colors';

import { ProgressBar } from '../progress-bar/ProgressBar';

const StyledMotionContainer = styled(motion.div)<
  Pick<SnackbarProps, 'variant'>
>`
  align-items: center;
  background-color: ${({ theme, variant }) => {
    switch (variant) {
      case 'error':
        return theme.color.red50;
      case 'success':
        return theme.color.turquoise50;
      case 'info':
      default:
        return theme.color.gray80;
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  color: ${({ theme, variant }) => {
    switch (variant) {
      case 'error':
        return theme.color.red20;
      case 'success':
        return theme.color.turquoise20;
      case 'info':
      default:
        return theme.color.gray0;
    }
  }};
  cursor: pointer;
  display: flex;
  height: 40px;
  overflow: hidden;
  padding: ${({ theme }) => theme.spacing(2)};
  pointer-events: auto;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 999;
`;

const ProgressBarContainer = styled.div`
  height: 5px;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
`;

export type SnackbarVariant = 'info' | 'error' | 'success';

export interface SnackbarProps {
  role?: 'alert' | 'status';
  title?: string;
  isOpen?: boolean;
  allowDismiss?: boolean;
  duration?: number;
  variant?: SnackbarVariant;
  children?: React.ReactNode;
  onClose?: () => void;
}

export function Snackbar({
  duration = 6000,
  isOpen = false,
  allowDismiss = true,
  onClose,
  role = 'status',
  variant = 'info',
  title,
  children,
  ...rootProps
}: SnackbarProps) {
  const shouldReduceMotion = useReducedMotion();

  const theme = useTheme();

  const [snackbarTimeout, setSnackbarTimeout] = useState<number | null>(
    duration,
  );

  const onMouseEnter = () => setSnackbarTimeout(null);
  const onMouseLeave = () => setSnackbarTimeout(duration);
  const closeSnackbar = useCallback(() => {
    onClose && onClose();
  }, [onClose]);

  const callbackRef = useRef<() => void | null>();

  useEffect(() => {
    if (!callbackRef.current) {
      callbackRef.current = closeSnackbar;
    }
  }, [closeSnackbar]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const tick = () => {
      if (callbackRef.current) {
        callbackRef.current();
      }
    };

    if (snackbarTimeout) {
      const id = setTimeout(tick, snackbarTimeout);
      return () => clearTimeout(id);
    }
  }, [snackbarTimeout, isOpen]);

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <StyledMotionContainer
          aria-live={role === 'alert' ? 'assertive' : 'polite'}
          role={role}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          variant={variant}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -40 }}
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  y: 0,
                }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  y: 60,
                  transition: { duration: 0.25, ease: 'easeIn' },
                }
          }
          {...rootProps}
        >
          <ProgressBarContainer>
            <ProgressBar
              barHeight={5}
              fillColor={rgba(theme.color.gray0, 0.3)}
              duration={duration}
            />
          </ProgressBarContainer>
          {children ? children : title}
          {allowDismiss && (
            <>
              <IconX aria-label="Close" onClick={closeSnackbar} size={16} />
            </>
          )}
        </StyledMotionContainer>
      ) : null}
    </AnimatePresence>
  );
}
