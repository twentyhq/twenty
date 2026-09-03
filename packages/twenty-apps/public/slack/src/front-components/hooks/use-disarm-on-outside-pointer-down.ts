import { useEffect, type RefObject } from 'react';

type UseDisarmOnOutsidePointerDownParams = {
  isArmed: boolean;
  armedElementRef: RefObject<HTMLElement | null>;
  onDisarm: () => void;
};

export const useDisarmOnOutsidePointerDown = ({
  isArmed,
  armedElementRef,
  onDisarm,
}: UseDisarmOnOutsidePointerDownParams) => {
  useEffect(() => {
    if (!isArmed) {
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        armedElementRef.current?.contains(target) === true
      ) {
        return;
      }

      onDisarm();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () =>
      document.removeEventListener('pointerdown', handlePointerDown, true);
  }, [isArmed, armedElementRef, onDisarm]);
};
