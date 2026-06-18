/* oxlint-disable twenty/no-hardcoded-colors -- the toast's success-green / error-red
   accent rail are semantic status constants (mirrored from the pill language §7),
   not theme tokens. The surface itself uses Mantine/Twenty CSS variables. */
import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ActionIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
} from 'twenty-ui/display';

// A lightweight inline toast for the Social Posting Calendar (S4). Twenty has no
// global toast host and @mantine/notifications isn't installed, so the hero owns a
// single self-dismissing toast inside its own Mantine scope. Used to surface a
// reschedule failure (the server's COMPLIANCE_BLOCK / error envelope message) and
// to confirm a successful mutation — both per §15 ("failure → spring back + toast").
//
// Motion (§15): enters with a small spring settle (translateY + opacity), exits as
// a fade; reduced-motion drops the translate. Only transform/opacity animate (GPU).

export type ToastTone = 'success' | 'error';

export type CalendarToastState = {
  id: number;
  tone: ToastTone;
  message: string;
};

const ACCENT: Record<ToastTone, string> = {
  success: '#2F9E44',
  error: '#C92A2A',
};

export const CalendarToast = ({
  toast,
  onDismiss,
}: {
  toast: CalendarToastState | null;
  onDismiss: () => void;
}) => {
  const reduce = useReducedMotion() ?? false;

  // Auto-dismiss: errors linger longer (the operator must read the reason); a
  // success confirmation clears quickly. Keyed on the toast id so each new toast
  // restarts the timer (and a re-toast while one is visible resets cleanly).
  useEffect(() => {
    if (toast === null) return;
    const ms = toast.tone === 'error' ? 6500 : 3200;
    const t = window.setTimeout(onDismiss, ms);
    return () => window.clearTimeout(t);
  }, [toast?.id, toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast !== null ? (
        <motion.div
          key={toast.id}
          role="status"
          aria-live={toast.tone === 'error' ? 'assertive' : 'polite'}
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, transform: 'translateY(12px) scale(0.97)' }
          }
          animate={
            reduce
              ? { opacity: 1 }
              : { opacity: 1, transform: 'translateY(0px) scale(1)' }
          }
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
          transition={
            reduce
              ? { duration: 0.18 }
              : { type: 'spring', duration: 0.5, bounce: 0.18 }
          }
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            zIndex: 1100, // above the drawer/composer overlays (z-index: 1001)
            maxWidth: 420,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'var(--mantine-color-body)',
            border: '1px solid var(--mantine-color-default-border)',
            borderLeft: `3px solid ${ACCENT[toast.tone]}`,
            boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
          }}
        >
          {toast.tone === 'error' ? (
            <IconAlertTriangle
              size={17}
              style={{ flex: 'none', color: ACCENT.error, marginTop: 1 }}
            />
          ) : (
            <IconCheck
              size={17}
              style={{ flex: 'none', color: ACCENT.success, marginTop: 1 }}
            />
          )}
          <span
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: 13,
              lineHeight: 1.4,
              color: 'var(--mantine-color-text)',
              wordBreak: 'break-word',
            }}
          >
            {toast.message}
          </span>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            aria-label="Dismiss"
            onClick={onDismiss}
            style={{ flex: 'none', marginTop: -2 }}
          >
            <IconX size={15} />
          </ActionIcon>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
