import { isDefined } from '@ui/utilities/isDefined';
import { RefObject, useEffect, useState } from 'react';

export const useLastVisibleGroup = (
  scrollContainerRef: RefObject<HTMLElement>,
) => {
  const [lastVisibleGroupId, setLastVisibleGroupId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Filtrer les entrées qui sont au moins partiellement visibles
        const partiallyVisible = entries.filter(
          (entry) => entry.intersectionRatio < 1 && entry.intersectionRatio > 0,
        );

        if (isDefined(partiallyVisible.length)) {
          // Prendre le premier tbody partiellement visible
          const tbodyElement = partiallyVisible[0].target as HTMLElement;
          const groupId = tbodyElement.getAttribute('id');
          setLastVisibleGroupId(groupId);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      },
    );

    // Observer tous les tbody
    const tbodyElements = scrollContainerRef.current?.querySelectorAll('tbody');
    console.log('tbodyElements', tbodyElements, scrollContainerRef);
    tbodyElements?.forEach((tbody) => observer.observe(tbody));

    return () => observer.disconnect();
  }, [scrollContainerRef]);

  return lastVisibleGroupId;
};
