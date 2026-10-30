import { useEffect } from 'react';

type OnMountEffectProps = {
  onMount: () => void;
};

export const OnMountEffect = ({ onMount }: OnMountEffectProps) => {
  useEffect(() => {
    onMount();
  }, []);

  return null;
};
