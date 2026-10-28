import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

const FAVICON_SIZE = 64;
const ATTENTION_DOT_RADIUS = 12;
const ATTENTION_DOT_NOTCH_RADIUS = 16;

export const drawFaviconWithAttentionDot = async ({
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
    throw new Error(doNotTranslate('Canvas 2D context is unavailable'));
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
