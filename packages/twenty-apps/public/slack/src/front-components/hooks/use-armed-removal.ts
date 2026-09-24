import { useEffect, useState } from 'react';

type ArmedRemovalState = {
  armedId: string | null;
  arm: (id: string) => void;
  disarm: () => void;
};

const REMOVAL_CONFIRM_TIMEOUT_MS = 4000;

export const useArmedRemoval = (): ArmedRemovalState => {
  const [armedId, setArmedId] = useState<string | null>(null);

  useEffect(() => {
    if (armedId === null) {
      return undefined;
    }

    const disarmTimer = setTimeout(
      () => setArmedId(null),
      REMOVAL_CONFIRM_TIMEOUT_MS,
    );

    return () => clearTimeout(disarmTimer);
  }, [armedId]);

  return {
    armedId,
    arm: setArmedId,
    disarm: () => setArmedId(null),
  };
};
