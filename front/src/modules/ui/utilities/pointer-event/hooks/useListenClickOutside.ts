import React, { useEffect } from 'react';

export enum ClickOutsideMode {
  absolute = 'absolute',
  dom = 'dom',
}

export function useListenClickOutside<T extends Element>({
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

export const useListenClickOutsideByClassName = ({
  className,
  callback,
}: {
  className: string;
  callback: () => void;
}) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedElement = event.target as HTMLElement;
      let isClickedInside = false;
      let currentElement: HTMLElement | null = clickedElement;

      // Check if the clicked element or any of its parent elements have the specified class
      while (currentElement) {
        if (currentElement.classList.contains(className)) {
          isClickedInside = true;
          break;
        }
        currentElement = currentElement.parentElement;
      }

      if (!isClickedInside) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, className]);
};
