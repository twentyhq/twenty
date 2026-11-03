import { isUndefined } from '@sniptt/guards';
import { type OverlayOptions } from 'sharp';
import { isDefined } from 'twenty-sdk/utils';

import {
  CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
  CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
} from 'src/logic-functions/constants/camera-tile-asset-paths';
import {
  CAMERA_TILE_BACKGROUND_COLOR,
  CAMERA_TILE_INITIAL_COLOR,
  CAMERA_TILE_INITIAL_FONT_SIZE,
  CAMERA_TILE_LOGO_BOX_SIZE,
  CAMERA_TILE_MINIMAL_FONT_SIZE,
  CAMERA_TILE_NOTES_BY_TWENTY,
  CAMERA_TILE_PLATE_COLOR,
  CAMERA_TILE_PLATE_RADIUS,
  CAMERA_TILE_PLATE_SIZE,
  CAMERA_TILE_PLATE_STROKE_COLOR,
  CAMERA_TILE_PLATE_TOP,
  CAMERA_TILE_RECORDING_BOTTOM_INSET,
  CAMERA_TILE_RECORDING_DOT_COLOR,
  CAMERA_TILE_RECORDING_DOT_GAP,
  CAMERA_TILE_RECORDING_DOT_SIZE,
  CAMERA_TILE_RECORDING_FONT_SIZE,
  CAMERA_TILE_RECORDING_LABEL,
  CAMERA_TILE_SECONDARY_TEXT_OPACITY,
  CAMERA_TILE_SUBTITLE_FONT_SIZE,
  CAMERA_TILE_SUBTITLE_LINE_HEIGHT,
  CAMERA_TILE_TEXT_LINE_GAP,
  CAMERA_TILE_TEXT_MAX_WIDTH,
  CAMERA_TILE_TEXT_TOP,
  CAMERA_TILE_TITLE_FONT_SIZE,
  CAMERA_TILE_TITLE_LINE_HEIGHT,
  CAMERA_TILE_TWENTY_SUBTITLE,
  CAMERA_TILE_TWENTY_TITLE,
} from 'src/logic-functions/constants/camera-tile-config';
import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';
import { type WorkspaceBranding } from 'src/logic-functions/data/get-workspace-branding.util';
import {
  type CameraTileText,
  renderCameraTileText,
} from 'src/logic-functions/domain/render-camera-tile-text.util';
import { type CallRecorderStyle } from 'src/logic-functions/types/call-recorder-style.type';
import { canRenderWithCameraTileFont } from 'src/logic-functions/utils/can-render-with-camera-tile-font.util';
import { type SharpFactory } from 'src/logic-functions/utils/load-sharp.util';

export type CameraTileLayout = {
  backgroundAssetPath: string | undefined;
  composites: OverlayOptions[];
  recordingComposites: OverlayOptions[];
};

type TextRenderer = (
  options: Omit<
    Parameters<typeof renderCameraTileText>[0],
    'sharp' | 'fontFilePath'
  >,
) => Promise<CameraTileText>;

type TextLine = { text: CameraTileText; lineHeight: number };

const centerHorizontally = (
  item: { input: Buffer; width: number },
  top: number,
): OverlayOptions => ({
  input: item.input,
  left: Math.round((RECALL_BOT_IMAGE_WIDTH - item.width) / 2),
  top: Math.round(top),
});

// A soft patch of background colour keeps text readable over the pattern.
const buildScrimSvg = ({
  centerY,
  radiusX,
  radiusY,
}: {
  centerY: number;
  radiusX: number;
  radiusY: number;
}) =>
  [
    '<defs><radialGradient id="scrim" cx="50%" cy="50%" r="50%">',
    `<stop offset="0.45" stop-color="${CAMERA_TILE_BACKGROUND_COLOR}" stop-opacity="0.94"/>`,
    `<stop offset="1" stop-color="${CAMERA_TILE_BACKGROUND_COLOR}" stop-opacity="0"/>`,
    '</radialGradient></defs>',
    `<ellipse cx="${RECALL_BOT_IMAGE_WIDTH / 2}" cy="${centerY}" rx="${radiusX}" ry="${radiusY}" fill="url(#scrim)"/>`,
  ].join('');

const buildPlateSvg = () => {
  const left = (RECALL_BOT_IMAGE_WIDTH - CAMERA_TILE_PLATE_SIZE) / 2;
  const plate = `x="${left}" y="${CAMERA_TILE_PLATE_TOP}" width="${CAMERA_TILE_PLATE_SIZE}" height="${CAMERA_TILE_PLATE_SIZE}" rx="${CAMERA_TILE_PLATE_RADIUS}"`;

  return [
    '<defs><filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">',
    '<feGaussianBlur in="SourceAlpha" stdDeviation="26"/><feOffset dy="16"/>',
    '<feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer>',
    '</filter></defs>',
    `<rect ${plate} fill="#000" filter="url(#shadow)"/>`,
    `<rect ${plate} fill="${CAMERA_TILE_PLATE_COLOR}" stroke="${CAMERA_TILE_PLATE_STROKE_COLOR}" stroke-width="2"/>`,
  ].join('');
};

const renderSvgLayer = async (
  sharp: SharpFactory,
  content: string,
): Promise<OverlayOptions> => ({
  input: await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${RECALL_BOT_IMAGE_WIDTH}" height="${RECALL_BOT_IMAGE_HEIGHT}">${content}</svg>`,
    ),
  )
    .png()
    .toBuffer(),
  left: 0,
  top: 0,
});

const buildTextBlock = (lines: TextLine[]) => {
  let top = CAMERA_TILE_TEXT_TOP;

  const lineComposites = lines.map((line) => {
    const composite = centerHorizontally(line.text, top);

    top += line.lineHeight + CAMERA_TILE_TEXT_LINE_GAP;

    return composite;
  });

  const blockHeight = top - CAMERA_TILE_TEXT_LINE_GAP - CAMERA_TILE_TEXT_TOP;
  const blockWidth = Math.max(...lines.map((line) => line.text.width));

  return {
    lineComposites,
    scrimSvg: buildScrimSvg({
      centerY: CAMERA_TILE_TEXT_TOP + blockHeight / 2,
      radiusX: blockWidth / 2 + 160,
      radiusY: blockHeight / 2 + 50,
    }),
  };
};

const centerInPlate = (item: {
  input: Buffer;
  width: number;
  height: number;
}): OverlayOptions => ({
  input: item.input,
  left: Math.round((RECALL_BOT_IMAGE_WIDTH - item.width) / 2),
  top: Math.round(
    CAMERA_TILE_PLATE_TOP + (CAMERA_TILE_PLATE_SIZE - item.height) / 2,
  ),
});

const renderLogo = async (
  sharp: SharpFactory,
  logo: Buffer,
): Promise<OverlayOptions | undefined> => {
  try {
    // Animated sources collapse to their first frame, which is the intended tile.
    const { data, info } = await sharp(logo)
      .resize(CAMERA_TILE_LOGO_BOX_SIZE, CAMERA_TILE_LOGO_BOX_SIZE, {
        fit: 'inside',
      })
      .png()
      .toBuffer({ resolveWithObject: true });

    return centerInPlate({
      input: data,
      width: info.width,
      height: info.height,
    });
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read workspace logo: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};

const buildWorkspaceComposites = async ({
  sharp,
  renderText,
  branding,
  isNotesByTwentyEnabled,
}: {
  sharp: SharpFactory;
  renderText: TextRenderer;
  branding: WorkspaceBranding | undefined;
  isNotesByTwentyEnabled: boolean;
}): Promise<OverlayOptions[] | undefined> => {
  const displayName =
    isDefined(branding?.displayName) &&
    canRenderWithCameraTileFont(branding.displayName)
      ? branding.displayName
      : undefined;

  const logo = isDefined(branding?.logo)
    ? await renderLogo(sharp, branding.logo)
    : undefined;

  const plateContent =
    logo ??
    (isDefined(displayName)
      ? centerInPlate(
          await renderText({
            text: Array.from(displayName)[0].toLocaleUpperCase(),
            fontSize: CAMERA_TILE_INITIAL_FONT_SIZE,
            color: CAMERA_TILE_INITIAL_COLOR,
          }),
        )
      : undefined);

  if (isUndefined(plateContent)) {
    return undefined;
  }

  const lines: TextLine[] = [];

  if (isDefined(displayName)) {
    lines.push({
      text: await renderText({
        text: displayName,
        fontSize: CAMERA_TILE_TITLE_FONT_SIZE,
        maxWidth: CAMERA_TILE_TEXT_MAX_WIDTH,
      }),
      lineHeight: CAMERA_TILE_TITLE_LINE_HEIGHT,
    });
  }

  if (isNotesByTwentyEnabled) {
    lines.push({
      text: await renderText({
        text: CAMERA_TILE_NOTES_BY_TWENTY,
        fontSize: CAMERA_TILE_SUBTITLE_FONT_SIZE,
        opacity: CAMERA_TILE_SECONDARY_TEXT_OPACITY,
      }),
      lineHeight: CAMERA_TILE_SUBTITLE_LINE_HEIGHT,
    });
  }

  if (lines.length === 0) {
    return [await renderSvgLayer(sharp, buildPlateSvg()), plateContent];
  }

  const { lineComposites, scrimSvg } = buildTextBlock(lines);

  return [
    await renderSvgLayer(sharp, scrimSvg + buildPlateSvg()),
    plateContent,
    ...lineComposites,
  ];
};

const buildRecordingComposites = async (
  sharp: SharpFactory,
  renderText: TextRenderer,
): Promise<OverlayOptions[]> => {
  const label = await renderText({
    text: CAMERA_TILE_RECORDING_LABEL,
    fontSize: CAMERA_TILE_RECORDING_FONT_SIZE,
    opacity: CAMERA_TILE_SECONDARY_TEXT_OPACITY,
  });

  const left = Math.round(
    (RECALL_BOT_IMAGE_WIDTH -
      (CAMERA_TILE_RECORDING_DOT_SIZE +
        CAMERA_TILE_RECORDING_DOT_GAP +
        label.width)) /
      2,
  );
  const top =
    RECALL_BOT_IMAGE_HEIGHT - CAMERA_TILE_RECORDING_BOTTOM_INSET - label.height;
  const centerY = top + label.height / 2;

  return [
    await renderSvgLayer(
      sharp,
      buildScrimSvg({ centerY, radiusX: 200, radiusY: 44 }) +
        `<circle cx="${left + CAMERA_TILE_RECORDING_DOT_SIZE / 2}" cy="${centerY}" r="${CAMERA_TILE_RECORDING_DOT_SIZE / 2}" fill="${CAMERA_TILE_RECORDING_DOT_COLOR}"/>`,
    ),
    {
      input: label.input,
      left:
        left + CAMERA_TILE_RECORDING_DOT_SIZE + CAMERA_TILE_RECORDING_DOT_GAP,
      top,
    },
  ];
};

export const buildCameraTileLayout = async ({
  sharp,
  style,
  branding,
  fontFilePath,
  isNotesByTwentyEnabled,
}: {
  sharp: SharpFactory;
  style: Exclude<CallRecorderStyle, 'NONE'>;
  branding: WorkspaceBranding | undefined;
  fontFilePath: string;
  isNotesByTwentyEnabled: boolean;
}): Promise<CameraTileLayout> => {
  const renderText: TextRenderer = (options) =>
    renderCameraTileText({ sharp, fontFilePath, ...options });

  const recordingComposites = await buildRecordingComposites(sharp, renderText);

  if (style === 'MINIMAL') {
    const word = await renderText({
      text: CAMERA_TILE_TWENTY_TITLE,
      fontSize: CAMERA_TILE_MINIMAL_FONT_SIZE,
    });

    return {
      backgroundAssetPath: undefined,
      composites: [
        centerHorizontally(word, (RECALL_BOT_IMAGE_HEIGHT - word.height) / 2),
      ],
      recordingComposites,
    };
  }

  if (style === 'WORKSPACE') {
    const workspaceComposites = await buildWorkspaceComposites({
      sharp,
      renderText,
      branding,
      isNotesByTwentyEnabled,
    });

    if (isDefined(workspaceComposites)) {
      return {
        backgroundAssetPath: CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
        composites: workspaceComposites,
        recordingComposites,
      };
    }
  }

  const { lineComposites, scrimSvg } = buildTextBlock([
    {
      text: await renderText({
        text: CAMERA_TILE_TWENTY_TITLE,
        fontSize: CAMERA_TILE_TITLE_FONT_SIZE,
      }),
      lineHeight: CAMERA_TILE_TITLE_LINE_HEIGHT,
    },
    {
      text: await renderText({
        text: CAMERA_TILE_TWENTY_SUBTITLE,
        fontSize: CAMERA_TILE_SUBTITLE_FONT_SIZE,
        opacity: CAMERA_TILE_SECONDARY_TEXT_OPACITY,
      }),
      lineHeight: CAMERA_TILE_SUBTITLE_LINE_HEIGHT,
    },
  ]);

  return {
    backgroundAssetPath: CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
    composites: [await renderSvgLayer(sharp, scrimSvg), ...lineComposites],
    recordingComposites,
  };
};
