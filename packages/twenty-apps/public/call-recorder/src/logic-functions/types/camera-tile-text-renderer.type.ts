import {
  type CameraTileText,
  type renderCameraTileText,
} from 'src/logic-functions/domain/render-camera-tile-text.util';

export type CameraTileTextRenderer = (
  options: Omit<
    Parameters<typeof renderCameraTileText>[0],
    'sharp' | 'fontFilePath'
  >,
) => Promise<CameraTileText>;
