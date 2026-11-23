import { useEffect } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError, isDefined } from 'twenty-shared/utils';

import { type FaviconWithAttentionDot } from '@/app/types/FaviconWithAttentionDot';

const FAVICON_SIZE = 64;
const ATTENTION_DOT_RADIUS = 12;
const ATTENTION_DOT_NOTCH_RADIUS = 16;

const drawFaviconWithAttentionDotOrThrow = async ({
  faviconUrl,
  dotColor,
}: {
  faviconUrl: string;
  dotColor: string;
}): Promise<string> => {
  const favicon = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = faviconUrl;
  });

  const canvas = document.createElement('canvas');

  canvas.width = FAVICON_SIZE;
  canvas.height = FAVICON_SIZE;

  const context = canvas.getContext('2d');

  if (!isDefined(context)) {
    throw new CustomError(
      doNotTranslate('Canvas 2D context is unavailable'),
      'CANVAS_2D_CONTEXT_UNAVAILABLE',
    );
  }

  const dotCenterX = FAVICON_SIZE - ATTENTION_DOT_RADIUS;
  const dotCenterY = ATTENTION_DOT_RADIUS;

  context.imageSmoothingQuality = 'high';
  context.drawImage(favicon, 0, 0, FAVICON_SIZE, FAVICON_SIZE);

  context.globalCompositeOperation = 'destination-out';
  context.beginPath();
  context.arc(
    dotCenterX,
    dotCenterY,
    ATTENTION_DOT_NOTCH_RADIUS,
    0,
    Math.PI * 2,
  );
  context.fill();

  context.globalCompositeOperation = 'source-over';
  context.fillStyle = dotColor;
  context.beginPath();
  context.arc(dotCenterX, dotCenterY, ATTENTION_DOT_RADIUS, 0, Math.PI * 2);
  context.fill();

  return canvas.toDataURL('image/png');
};

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
