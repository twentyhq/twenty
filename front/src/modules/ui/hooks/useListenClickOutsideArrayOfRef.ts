import React, { useEffect } from 'react';

export enum ClickOutsideMode {
  absolute = 'absolute',
  dom = 'dom',
}

export function useListenClickOutsideArrayOfRef<T extends Element>({
  refs,
  callback,
  mode = ClickOutsideMode.dom,
}: {
  refs: Array<React.RefObject<T>>;
  callback: (event: MouseEvent | TouchEvent) => void;
  mode?: ClickOutsideMode;
}) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (mode === ClickOutsideMode.dom) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => ref.current?.contains(event.target as Node));

        if (!clickedOnAtLeastOneRef) {
          callback(event);
        }
      }

      if (mode === ClickOutsideMode.absolute) {
        const clickedOnAtLeastOneRef = refs
          .filter((ref) => !!ref.current)
          .some((ref) => {
            if (!ref.current) {
              return false;
            }

            console.log({ event, ref: ref.current.getBoundingClientRect() });

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
        if (!clickedOnAtLeastOneRef) {
          callback(event);
        }
      }
    }

    document.addEventListener('click', handleClickOutside, { capture: true });
    document.addEventListener('touchend', handleClickOutside, {
      capture: true,
    });

    return () => {
      document.removeEventListener('click', handleClickOutside, {
        capture: true,
      });
      document.removeEventListener('touchend', handleClickOutside, {
        capture: true,
      });
    };
  }, [refs, callback, mode]);
}
