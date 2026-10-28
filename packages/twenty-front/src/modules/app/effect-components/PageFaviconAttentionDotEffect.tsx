import { useEffect } from 'react';

import { type FaviconWithAttentionDot } from '@/app/types/FaviconWithAttentionDot';
import { drawFaviconWithAttentionDotOrThrow } from '@/app/utils/drawFaviconWithAttentionDotOrThrow';

type PageFaviconAttentionDotEffectProps = {
  faviconUrl: string;
  dotColor: string;
  onFaviconDrawn: (faviconWithAttentionDot: FaviconWithAttentionDot) => void;
};

export const PageFaviconAttentionDotEffect = ({
  faviconUrl,
  dotColor,
  onFaviconDrawn,
}: PageFaviconAttentionDotEffectProps) => {
  useEffect(() => {
    let isCancelled = false;

    drawFaviconWithAttentionDotOrThrow({ faviconUrl, dotColor })
      .then((dataUrl) => {
        if (!isCancelled) {
          onFaviconDrawn({ faviconUrl, dotColor, dataUrl });
        }
      })
      .catch(() => undefined);

    return () => {
      isCancelled = true;
    };
  }, [dotColor, faviconUrl, onFaviconDrawn]);

  return null;
};
