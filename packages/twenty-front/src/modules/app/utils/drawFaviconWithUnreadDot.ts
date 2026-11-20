import { isDefined } from 'twenty-shared/utils';
import { THEME_LIGHT } from 'twenty-ui/theme';

const FAVICON_SIZE = 64;
const UNREAD_DOT_RADIUS = 14;
const UNREAD_DOT_GAP = 5;

const loadCrossOriginImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load favicon ${url}`));
    image.src = url;
  });

const fillUnreadDotCircle = (
  context: CanvasRenderingContext2D,
  radius: number,
) => {
  context.beginPath();
  context.arc(
    FAVICON_SIZE - UNREAD_DOT_RADIUS,
    UNREAD_DOT_RADIUS,
    radius,
    0,
    2 * Math.PI,
  );
  context.fill();
};

export const drawFaviconWithUnreadDot = async (faviconUrl: string) => {
  const image = await loadCrossOriginImage(faviconUrl);
  const canvas = document.createElement('canvas');

  canvas.width = FAVICON_SIZE;
  canvas.height = FAVICON_SIZE;

  const context = canvas.getContext('2d');

  if (!isDefined(context)) {
    throw new Error('Canvas 2D context is not available');
  }

  context.drawImage(image, 0, 0, FAVICON_SIZE, FAVICON_SIZE);

  context.globalCompositeOperation = 'destination-out';
  fillUnreadDotCircle(context, UNREAD_DOT_RADIUS + UNREAD_DOT_GAP);

  context.globalCompositeOperation = 'source-over';
  context.fillStyle = THEME_LIGHT.color.red;
  fillUnreadDotCircle(context, UNREAD_DOT_RADIUS);

  return canvas.toDataURL('image/png');
};
