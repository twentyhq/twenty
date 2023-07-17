import React, { useEffect } from 'react';

import { isDefined } from '~/utils/isDefined';

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
  callback: (event?: MouseEvent | TouchEvent) => void;
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
              'clientX' in event ? event.clientX : event.touches[0].clientX;
            const clientY =
              'clientY' in event ? event.clientY : event.touches[0].clientY;

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

    const hasAtLeastOneRefDefined = refs.some((ref) => isDefined(ref.current));

    if (hasAtLeastOneRefDefined) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [refs, callback, mode]);
}
