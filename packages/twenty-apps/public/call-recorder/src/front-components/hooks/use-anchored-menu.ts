import { isUndefined } from '@sniptt/guards';
import { useCallback, useEffect, useRef, useState } from 'react';

import { FLOATING_MENU_REPOSITION_INTERVAL_MILLISECONDS } from 'src/front-components/constants/floating-menu.constant';
import { type AnchorRect } from 'src/front-components/types/anchor-rect.type';

const measureAnchor = (element: HTMLElement | null): AnchorRect | undefined => {
  if (element === null) {
    return undefined;
  }

  const rect = element.getBoundingClientRect();

  return {
    top: rect.top,
    left: rect.left,
    bottom: rect.bottom,
    width: rect.width,
  };
};

const areAnchorRectsEqual = (
  left: AnchorRect | undefined,
  right: AnchorRect | undefined,
): boolean =>
  left?.top === right?.top &&
  left?.left === right?.left &&
  left?.bottom === right?.bottom &&
  left?.width === right?.width;

export const useAnchoredMenu = () => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [anchorRect, setAnchorRect] = useState<AnchorRect | undefined>(
    undefined,
  );

  const isOpen = !isUndefined(anchorRect);

  const close = useCallback(() => setAnchorRect(undefined), []);

  const toggle = useCallback(() => {
    setAnchorRect((previousAnchorRect) =>
      isUndefined(previousAnchorRect)
        ? measureAnchor(anchorRef.current)
        : undefined,
    );
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const intervalId = setInterval(() => {
      const nextAnchorRect = measureAnchor(anchorRef.current);

      setAnchorRect((previousAnchorRect) =>
        areAnchorRectsEqual(previousAnchorRect, nextAnchorRect)
          ? previousAnchorRect
          : nextAnchorRect,
      );
    }, FLOATING_MENU_REPOSITION_INTERVAL_MILLISECONDS);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  return { anchorRef, anchorRect, isOpen, close, toggle };
};
