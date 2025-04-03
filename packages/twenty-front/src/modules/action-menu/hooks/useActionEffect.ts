import { hasActionBeenExecutedComponentState } from '@/action-menu/states/hasActionBeenExecutedComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useEffect } from 'react';

export const useActionEffect = (
  callback: () => void,
  dependencies: unknown[],
) => {
  const [hasActionBeenExecuted, setHasActionBeenExecuted] =
    useRecoilComponentStateV2(hasActionBeenExecutedComponentState);

  useEffect(() => {
    if (!hasActionBeenExecuted) {
      callback();
      setHasActionBeenExecuted(true);
    }
  }, [
    callback,
    hasActionBeenExecuted,
    setHasActionBeenExecuted,
    // eslint-disable-next-line
    ...dependencies,
  ]);
};
