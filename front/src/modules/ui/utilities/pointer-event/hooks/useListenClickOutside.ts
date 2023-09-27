import React, { useEffect } from 'react';

export enum ClickOutsideMode {
  absolute = 'absolute',
  dom = 'dom',
}

export const useListenClickOutside = <T extends Element>({
  refs,
  callback,
  mode = ClickOutsideMode.dom,
  enabled = true,
}: {
  refs: Array<React.RefObject<T>>;
  callback: (event: MouseEvent | TouchEvent) => void;
  mode?: ClickOutsideMode;
  enabled?: boolean;
}) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
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
    };

    if (enabled) {
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
    }
  }, [refs, callback, mode, enabled]);
};

export const useListenClickOutsideByClassName = ({
  classNames,
  excludeClassNames,
  callback,
}: {
  classNames: string[];
  excludeClassNames?: string[];
  callback: () => void;
}) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!(event.target instanceof Node)) return;

      const clickedElement = event.target as HTMLElement;
      let isClickedInside = false;
      let isClickedOnExcluded = false;
      let currentElement: HTMLElement | null = clickedElement;

      while (currentElement) {
        const currentClassList = currentElement.classList;

        isClickedInside = classNames.some((className) =>
          currentClassList.contains(className),
        );
        isClickedOnExcluded =
          excludeClassNames?.some((className) =>
            currentClassList.contains(className),
          ) ?? false;

        if (isClickedInside || isClickedOnExcluded) {
          break;
        }

        currentElement = currentElement.parentElement;
      }

      if (!isClickedInside && !isClickedOnExcluded) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside, {
      capture: true,
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside, {
        capture: true,
      });
    };
  }, [callback, classNames, excludeClassNames]);
};
