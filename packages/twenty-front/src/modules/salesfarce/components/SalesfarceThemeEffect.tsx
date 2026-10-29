import { useLayoutEffect } from 'react';

import { SALESFARCE_CLASS_NAME } from '@/salesfarce/constants/SalesfarceClassName';
import { SALESFARCE_FAVICON_IMAGE } from '@/salesfarce/constants/SalesfarceFaviconImage';

type SalesfarceThemeEffectProps = {
  isActive: boolean;
};

export const SalesfarceThemeEffect = ({
  isActive,
}: SalesfarceThemeEffectProps) => {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle(SALESFARCE_CLASS_NAME, isActive);
  }, [isActive]);

  useLayoutEffect(() => {
    if (!isActive) {
      return;
    }

    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = SALESFARCE_FAVICON_IMAGE;

    const keepFaviconLast = () => {
      if (document.head.lastElementChild !== favicon) {
        document.head.appendChild(favicon);
      }
    };

    keepFaviconLast();

    const observer = new MutationObserver(keepFaviconLast);

    observer.observe(document.head, { childList: true });

    return () => {
      observer.disconnect();
      favicon.remove();
    };
  }, [isActive]);

  return null;
};
