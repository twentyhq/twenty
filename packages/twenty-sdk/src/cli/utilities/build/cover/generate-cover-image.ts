import sharp from 'sharp';

import { HALFTONE_BACKDROP_BASE64 } from '@/cli/utilities/build/cover/assets/halftone-backdrop-base64';
import { TWENTY_LOGO_MARK_PATH } from '@/cli/utilities/build/cover/assets/twenty-logo-mark-path';

const CANVAS_WIDTH = 1388;
const CANVAS_HEIGHT = 858;
const TILE_SIZE = 156;
const TILE_RADIUS = 16;
const TILE_Y = 351;
const LEFT_TILE_X = 434;
const RIGHT_TILE_X = 798;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;
const CROSS_ARM = 19;
const CROSS_STROKE = 8;
const CROSS_COLOR = '#b3b3b3';
const TWENTY_MARK_VIEWBOX = 40;
const TWENTY_MARK_SCALE = TILE_SIZE / TWENTY_MARK_VIEWBOX;

type GenerateCoverImageOptions = {
  logoBuffer: Buffer;
};

export const generateCoverImage = async ({
  logoBuffer,
}: GenerateCoverImageOptions): Promise<Buffer> => {
  const logoPngBuffer = await sharp(logoBuffer)
    .resize(TILE_SIZE, TILE_SIZE, { fit: 'cover', position: 'centre' })
    .png()
    .toBuffer();
  const logoDataUri = `data:image/png;base64,${logoPngBuffer.toString('base64')}`;

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">`,
    `<image href="data:image/png;base64,${HALFTONE_BACKDROP_BASE64}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" preserveAspectRatio="none" />`,
    '<defs>',
    '<filter id="tileShadow" x="-40%" y="-40%" width="180%" height="180%">',
    '<feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#0b0b0f" flood-opacity="0.14" />',
    '</filter>',
    `<clipPath id="leftLogoClip"><rect x="${LEFT_TILE_X}" y="${TILE_Y}" width="${TILE_SIZE}" height="${TILE_SIZE}" rx="${TILE_RADIUS}" /></clipPath>`,
    '</defs>',
    '<g filter="url(#tileShadow)">',
    `<rect x="${LEFT_TILE_X}" y="${TILE_Y}" width="${TILE_SIZE}" height="${TILE_SIZE}" rx="${TILE_RADIUS}" fill="#ffffff" />`,
    `<rect x="${RIGHT_TILE_X}" y="${TILE_Y}" width="${TILE_SIZE}" height="${TILE_SIZE}" rx="${TILE_RADIUS}" fill="#000000" />`,
    '</g>',
    `<image href="${logoDataUri}" x="${LEFT_TILE_X}" y="${TILE_Y}" width="${TILE_SIZE}" height="${TILE_SIZE}" preserveAspectRatio="xMidYMid slice" clip-path="url(#leftLogoClip)" />`,
    `<rect x="${LEFT_TILE_X}" y="${TILE_Y}" width="${TILE_SIZE}" height="${TILE_SIZE}" rx="${TILE_RADIUS}" fill="none" stroke="#000000" stroke-opacity="0.08" stroke-width="1" />`,
    `<g transform="translate(${RIGHT_TILE_X} ${TILE_Y}) scale(${TWENTY_MARK_SCALE})"><path d="${TWENTY_LOGO_MARK_PATH}" fill="#ffffff" /></g>`,
    `<line x1="${CENTER_X - CROSS_ARM}" y1="${CENTER_Y - CROSS_ARM}" x2="${CENTER_X + CROSS_ARM}" y2="${CENTER_Y + CROSS_ARM}" stroke="${CROSS_COLOR}" stroke-width="${CROSS_STROKE}" stroke-linecap="round" />`,
    `<line x1="${CENTER_X - CROSS_ARM}" y1="${CENTER_Y + CROSS_ARM}" x2="${CENTER_X + CROSS_ARM}" y2="${CENTER_Y - CROSS_ARM}" stroke="${CROSS_COLOR}" stroke-width="${CROSS_STROKE}" stroke-linecap="round" />`,
    '</svg>',
  ].join('');

  return sharp(Buffer.from(svg)).png().toBuffer();
};
