import { useEffect } from 'react';

const WELCOME_HOLD_DURATION_MS = 2900;
const DISMISS_KEYS = ['Escape', 'Enter', ' '];

type WelcomeAnimationDismissEffectProps = {
  onDismiss: () => void;
};

export const WelcomeAnimationDismissEffect = ({
  onDismiss,
}: WelcomeAnimationDismissEffectProps) => {
  useEffect(() => {
    const autoDismissTimeoutId = setTimeout(
      onDismiss,
      WELCOME_HOLD_DURATION_MS,
    );

    const handleDismissKeyDown = (event: KeyboardEvent) => {
      if (DISMISS_KEYS.includes(event.key)) {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleDismissKeyDown);

    return () => {
      clearTimeout(autoDismissTimeoutId);
      window.removeEventListener('keydown', handleDismissKeyDown);
    };
  }, [onDismiss]);

  return null;
};
