import { isUndefined } from '@sniptt/guards';

import {
  CAMERA_TILE_FONT_FAMILY,
  CAMERA_TILE_TEXT_COLOR,
} from 'src/logic-functions/constants/camera-tile-config';
import { renderTruncatedCameraTileText } from 'src/logic-functions/domain/render-truncated-camera-tile-text.util';
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
  const render = async (content: string): Promise<CameraTileText> => {
    const { data, info } = await sharp({
      text: {
        text: `<span foreground="${color}" alpha="${Math.round(opacity * 100)}%">${escapePangoMarkup(content)}</span>`,
        font: `${CAMERA_TILE_FONT_FAMILY} ${fontSize}`,
        fontfile: fontFilePath,
        rgba: true,
        dpi: 72,
      },
    })
      .png()
      .toBuffer({ resolveWithObject: true });

    return { input: data, width: info.width, height: info.height };
  };

  const fullText = await render(text);

  if (isUndefined(maxWidth) || fullText.width <= maxWidth) {
    return fullText;
  }

  return renderTruncatedCameraTileText({ text, maxWidth, render });
};
