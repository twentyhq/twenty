import React, { useEffect, useState } from 'react';

export enum ClickOutsideMode {
  comparePixels = 'comparePixels',
  compareHTMLRef = 'compareHTMLRef',
}

export const useListenClickOutside = <T extends Element>({
  refs,
  callback,
  mode = ClickOutsideMode.compareHTMLRef,
  enabled = true,
}: {
  refs: Array<React.RefObject<T>>;
  callback: (event: MouseEvent | TouchEvent) => void;
  mode?: ClickOutsideMode;
  enabled?: boolean;
}) => {
  const [isMouseDownInside, setIsMouseDownInside] = useState(false);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      if (mode === ClickOutsideMode.compareHTMLRef) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => ref.current?.contains(event.target as Node));

        setIsMouseDownInside(clickedOnAtLeastOneRef);
      }

      if (mode === ClickOutsideMode.comparePixels) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => {
            if (!ref.current) {
              return false;
            }

            const { x, y, width, height } = ref.current.getBoundingClientRect();

            const clientX =
              'clientX' in event
                ? event.clientX
                : event.changedTouches[0].clientX;
            const clientY =
              'clientY' in event
                ? event.clientY
                : event.changedTouches[0].clientY;

            if (
              clientX < x ||
              clientX > x + width ||
              clientY < y ||
              clientY > y + height
            ) {
              return false;
            }
            return true;
          });

        setIsMouseDownInside(clickedOnAtLeastOneRef);
      }
    };

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (mode === ClickOutsideMode.compareHTMLRef) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => ref.current?.contains(event.target as Node));

        if (!clickedOnAtLeastOneRef && !isMouseDownInside) {
          callback(event);
        }
      }

      if (mode === ClickOutsideMode.comparePixels) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => {
            if (!ref.current) {
              return false;
            }

            const { x, y, width, height } = ref.current.getBoundingClientRect();

            const clientX =
              'clientX' in event
                ? event.clientX
                : event.changedTouches[0].clientX;
            const clientY =
              'clientY' in event
                ? event.clientY
                : event.changedTouches[0].clientY;

            if (
              clientX < x ||
              clientX > x + width ||
              clientY < y ||
              clientY > y + height
            ) {
              return false;
            }
            return true;
          });

        if (!clickedOnAtLeastOneRef && !isMouseDownInside) {
          callback(event);
        }
      }
    };

    if (enabled) {
      document.addEventListener('mousedown', handleMouseDown, {
        capture: true,
      });
      document.addEventListener('click', handleClickOutside, { capture: true });
      document.addEventListener('touchstart', handleMouseDown, {
        capture: true,
      });
      document.addEventListener('touchend', handleClickOutside, {
        capture: true,
      });

      return () => {
        document.removeEventListener('mousedown', handleMouseDown, {
          capture: true,
        });
        document.removeEventListener('click', handleClickOutside, {
          capture: true,
        });
        document.removeEventListener('touchstart', handleMouseDown, {
          capture: true,
        });
        document.removeEventListener('touchend', handleClickOutside, {
          capture: true,
        });
      };
    }
  }, [refs, callback, mode, enabled, isMouseDownInside]);
};
