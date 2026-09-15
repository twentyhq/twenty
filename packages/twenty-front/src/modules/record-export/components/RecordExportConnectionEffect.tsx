import { useEffect } from 'react';

type RecordExportConnectionEffectProps = {
  cancel: () => void;
};

export const RecordExportConnectionEffect = ({
  cancel,
}: RecordExportConnectionEffectProps) => {
  useEffect(() => {
    window.addEventListener('pagehide', cancel);
    return () => {
      window.removeEventListener('pagehide', cancel);
      cancel();
    };
  }, [cancel]);

  return null;
};
