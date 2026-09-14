import { useLayoutEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { getDropdownMenuItemsContainerMaxHeight } from '@/ui/layout/dropdown/utils/getDropdownMenuItemsContainerMaxHeight';

export const useDropdownMenuItemsContainerMaxHeight = (enabled: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number>();

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!enabled || !isDefined(container)) {
      return;
    }

    const updateMaxHeight = () => {
      setMaxHeight(getDropdownMenuItemsContainerMaxHeight(container));
    };

    const resizeObserver = new ResizeObserver(updateMaxHeight);
    resizeObserver.observe(container);

    const mutationObserver = new MutationObserver(updateMaxHeight);
    mutationObserver.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    updateMaxHeight();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [enabled]);

  return { containerRef, maxHeight: enabled ? maxHeight : undefined };
};
