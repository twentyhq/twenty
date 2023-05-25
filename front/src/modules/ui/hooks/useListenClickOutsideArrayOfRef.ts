import React, { useEffect } from 'react';
import { isDefined } from '../../utils/type-guards/isDefined';

export function useListenClickOutsideArrayOfRef<T extends HTMLElement>(
  arrayOfRef: Array<React.RefObject<T>>,
  outsideClickCallback: (event?: MouseEvent) => void,
) {
  useEffect(() => {
    function handleClickOutside(event: any) {
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
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrayOfRef, outsideClickCallback]);
}
