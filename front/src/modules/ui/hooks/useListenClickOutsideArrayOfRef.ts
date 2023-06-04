import React, { useEffect } from 'react';

import { isDefined } from '@/utils/type-guards/isDefined';

export function useListenClickOutsideArrayOfRef<T extends HTMLElement>(
  arrayOfRef: Array<React.RefObject<T>>,
  outsideClickCallback: (event?: MouseEvent | TouchEvent) => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const clickedOnAtLeastOneRef = arrayOfRef
        .filter((ref) => !!ref.current)
        .some((ref) => ref.current?.contains(event.target as Node));

      if (!clickedOnAtLeastOneRef) {
        outsideClickCallback(event);
      }
    }

    const hasAtLeastOneRefDefined = arrayOfRef.some((ref) =>
      isDefined(ref.current),
    );

    if (hasAtLeastOneRefDefined) {
      document.addEventListener('mouseup', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayOfRef, outsideClickCallback]);
}
