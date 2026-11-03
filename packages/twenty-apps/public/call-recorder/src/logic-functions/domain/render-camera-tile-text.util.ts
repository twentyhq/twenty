import { isDefined } from 'twenty-sdk/utils';

import {
  CAMERA_TILE_FONT_FAMILY,
  CAMERA_TILE_TEXT_COLOR,
} from 'src/logic-functions/constants/camera-tile-config';
import { escapePangoMarkup } from 'src/logic-functions/utils/escape-pango-markup.util';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

export type CameraTileText = {
  input: Buffer;
  width: number;
  height: number;
};

export const renderCameraTileText = async ({
  sharp,
  fontFilePath,
  text,
  fontSize,
  color = CAMERA_TILE_TEXT_COLOR,
  opacity = 1,
  maxWidth,
}: {
  sharp: SharpFactory;
  fontFilePath: string;
  text: string;
  fontSize: number;
  color?: string;
  opacity?: number;
  maxWidth?: number;
}): Promise<CameraTileText> => {
  const markup = `<span foreground="${color}" alpha="${Math.round(opacity * 100)}%">${escapePangoMarkup(text)}</span>`;

  const render = (box?: { width: number; height: number }) =>
    sharp({
      text: {
        text: markup,
        font: `${CAMERA_TILE_FONT_FAMILY} ${fontSize}`,
        fontfile: fontFilePath,
        rgba: true,
        ...(box ?? { dpi: 72 }),
      },
    })
      .png()
      .toBuffer({ resolveWithObject: true });

  const naturalText = await render();

  const { data, info } =
    isDefined(maxWidth) && naturalText.info.width > maxWidth
      ? await render({ width: maxWidth, height: naturalText.info.height })
      : naturalText;

  return { input: data, width: info.width, height: info.height };
};
