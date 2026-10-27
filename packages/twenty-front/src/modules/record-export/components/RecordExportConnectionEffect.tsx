import { useEffect, useRef } from 'react';

type RecordExportConnectionEffectProps = {
  cancel: () => void;
};

export const RecordExportConnectionEffect = ({
  cancel,
}: RecordExportConnectionEffectProps) => {
  // oxlint-disable-next-line twenty/no-state-useref -- Tracks effect ownership, not render state.
  const activeCancelRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    activeCancelRef.current = cancel;
    window.addEventListener('pagehide', cancel);
    return () => {
      activeCancelRef.current = undefined;
      window.removeEventListener('pagehide', cancel);
      queueMicrotask(() => {
        if (activeCancelRef.current !== cancel) {
          cancel();
        }
      });
    };
  }, [cancel]);

  return null;
};
