import {
  RECORDING_STATUS_BADGE_BACKGROUND,
  RECORDING_STATUS_BADGE_BACKGROUND_OPACITY,
  RECORDING_STATUS_BADGE_COLOR,
  RECORDING_STATUS_BADGE_DOT_DIAMETER,
  RECORDING_STATUS_BADGE_HEIGHT,
  RECORDING_STATUS_BADGE_LABEL_LEFT,
  RECORDING_STATUS_BADGE_LABEL_PATH,
  RECORDING_STATUS_BADGE_LABEL_TOP,
  RECORDING_STATUS_BADGE_PADDING,
  RECORDING_STATUS_BADGE_WIDTH,
} from 'src/logic-functions/constants/recording-status-badge-config';

type SharpFactory = typeof import('sharp');

export const buildRecordingStatusBadgeSvg = (): string => {
  const dotRadius = RECORDING_STATUS_BADGE_DOT_DIAMETER / 2;

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${RECORDING_STATUS_BADGE_WIDTH}" height="${RECORDING_STATUS_BADGE_HEIGHT}">`,
    `<rect width="${RECORDING_STATUS_BADGE_WIDTH}" height="${RECORDING_STATUS_BADGE_HEIGHT}" rx="${RECORDING_STATUS_BADGE_HEIGHT / 2}" fill="${RECORDING_STATUS_BADGE_BACKGROUND}" fill-opacity="${RECORDING_STATUS_BADGE_BACKGROUND_OPACITY}" />`,
    `<circle cx="${RECORDING_STATUS_BADGE_PADDING + dotRadius}" cy="${RECORDING_STATUS_BADGE_HEIGHT / 2}" r="${dotRadius}" fill="${RECORDING_STATUS_BADGE_COLOR}" />`,
    `<path d="${RECORDING_STATUS_BADGE_LABEL_PATH}" transform="translate(${RECORDING_STATUS_BADGE_LABEL_LEFT} ${RECORDING_STATUS_BADGE_LABEL_TOP})" fill="${RECORDING_STATUS_BADGE_COLOR}" />`,
    '</svg>',
  ].join('');
};

export const buildRecordingStatusBadge = (
  sharp: SharpFactory,
): Promise<Buffer> =>
  sharp(Buffer.from(buildRecordingStatusBadgeSvg())).png().toBuffer();
