import { useEffect } from 'react';

type FrontComponentErrorEffectProps = {
  error: Error | null;
  onError: (error: Error) => void;
};
export const FrontComponentErrorEffect = ({
  error,
  onError,
}: FrontComponentErrorEffectProps) => {
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  return null;
};
