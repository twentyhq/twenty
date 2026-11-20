import { useEffect, useState } from 'react';

import { drawFaviconWithUnreadDot } from '@/app/utils/drawFaviconWithUnreadDot';

type DrawnFavicon = {
  faviconUrl: string;
  href: string;
};

export const useFaviconHrefWithUnreadDot = ({
  faviconUrl,
  hasUnreadDot,
}: {
  faviconUrl: string;
  hasUnreadDot: boolean;
}) => {
  const [drawnFavicon, setDrawnFavicon] = useState<DrawnFavicon | null>(null);

  useEffect(() => {
    if (!hasUnreadDot) {
      return;
    }

    let isStale = false;

    drawFaviconWithUnreadDot(faviconUrl)
      .then((href) => {
        if (!isStale) {
          setDrawnFavicon({ faviconUrl, href });
        }
      })
      .catch(() => undefined);

    return () => {
      isStale = true;
    };
  }, [faviconUrl, hasUnreadDot]);

  return hasUnreadDot && drawnFavicon?.faviconUrl === faviconUrl
    ? drawnFavicon.href
    : faviconUrl;
};
