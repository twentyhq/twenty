import { isUndefined } from '@sniptt/guards';
import { type OverlayOptions } from 'sharp';
import { isDefined } from 'twenty-sdk/utils';

import {
  CAMERA_TILE_INITIAL_COLOR,
  CAMERA_TILE_INITIAL_FONT_SIZE,
  CAMERA_TILE_PLATE_SIZE,
  CAMERA_TILE_PLATE_TOP,
  CAMERA_TILE_POWERED_BY_LABEL,
  CAMERA_TILE_SAFE_ZONE_WIDTH,
  CAMERA_TILE_SECONDARY_TEXT_OPACITY,
  CAMERA_TILE_SUBTITLE_FONT_SIZE,
  CAMERA_TILE_TITLE_FONT_SIZE,
} from 'src/logic-functions/constants/camera-tile-config';
import { type WorkspaceBranding } from 'src/logic-functions/data/get-workspace-branding.util';
import { buildCameraTilePlateSvg } from 'src/logic-functions/domain/build-camera-tile-plate-svg.util';
import { buildCameraTileTextBlock } from 'src/logic-functions/domain/build-camera-tile-text-block.util';
import { centerCameraTileItem } from 'src/logic-functions/domain/center-camera-tile-item.util';
import { renderCameraTileLogo } from 'src/logic-functions/domain/render-camera-tile-logo.util';
import { renderCameraTileSvgLayer } from 'src/logic-functions/domain/render-camera-tile-svg-layer.util';
import { type CameraTileTextRenderer } from 'src/logic-functions/types/camera-tile-text-renderer.type';
import { canRenderWithCameraTileFont } from 'src/logic-functions/utils/can-render-with-camera-tile-font.util';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

const renderInitial = async ({
  renderText,
  displayName,
}: {
  renderText: CameraTileTextRenderer;
  displayName: string;
}): Promise<OverlayOptions> => {
  const initial = await renderText({
    text: Array.from(displayName)[0].toLocaleUpperCase(),
    fontSize: CAMERA_TILE_INITIAL_FONT_SIZE,
    color: CAMERA_TILE_INITIAL_COLOR,
  });

  return centerCameraTileItem({
    item: initial,
    top: CAMERA_TILE_PLATE_TOP + (CAMERA_TILE_PLATE_SIZE - initial.height) / 2,
  });
};

const renderPoweredBy = (renderText: CameraTileTextRenderer) =>
  renderText({
    text: CAMERA_TILE_POWERED_BY_LABEL,
    fontSize: CAMERA_TILE_SUBTITLE_FONT_SIZE,
    opacity: CAMERA_TILE_SECONDARY_TEXT_OPACITY,
  });

export const buildCameraTileWorkspaceComposites = async ({
  sharp,
  renderText,
  branding,
}: {
  sharp: SharpFactory;
  renderText: CameraTileTextRenderer;
  branding: WorkspaceBranding | undefined;
}): Promise<OverlayOptions[] | undefined> => {
  const displayName =
    isDefined(branding?.displayName) &&
    canRenderWithCameraTileFont(branding.displayName)
      ? branding.displayName
      : undefined;

  const logo = isDefined(branding?.logo)
    ? await renderCameraTileLogo({ sharp, logo: branding.logo })
    : undefined;

  if (isUndefined(displayName)) {
    if (isUndefined(logo)) {
      return undefined;
    }

    const { lineComposites, scrimSvg } = buildCameraTileTextBlock({
      subtitle: await renderPoweredBy(renderText),
    });

    return [
      await renderCameraTileSvgLayer({
        sharp,
        content: scrimSvg + buildCameraTilePlateSvg(),
      }),
      logo,
      ...lineComposites,
    ];
  }

  const plateContent =
    logo ?? (await renderInitial({ renderText, displayName }));

  const { lineComposites, scrimSvg } = buildCameraTileTextBlock({
    title: await renderText({
      text: displayName,
      fontSize: CAMERA_TILE_TITLE_FONT_SIZE,
      maxWidth: CAMERA_TILE_SAFE_ZONE_WIDTH,
    }),
    subtitle: await renderPoweredBy(renderText),
  });

  return [
    await renderCameraTileSvgLayer({
      sharp,
      content: scrimSvg + buildCameraTilePlateSvg(),
    }),
    plateContent,
    ...lineComposites,
  ];
};
