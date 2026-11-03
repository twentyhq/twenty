import { isUndefined } from '@sniptt/guards';

import { fetchPublicAssetOrThrow } from 'src/logic-functions/data/fetch-public-asset-or-throw.util';
import { getCameraTileFontFilePathOrThrow } from 'src/logic-functions/data/get-camera-tile-font-file-path-or-throw.util';
import { getWorkspaceBranding } from 'src/logic-functions/data/get-workspace-branding.util';
import { buildBotImage } from 'src/logic-functions/domain/build-bot-image.util';
import { buildCameraTileLayout } from 'src/logic-functions/domain/build-camera-tile-layout.util';
import { type RecallBotAutomaticVideoOutput } from 'src/logic-functions/types/recall-bot-automatic-video-output.type';
import { getCallRecorderStyle } from 'src/logic-functions/utils/get-call-recorder-style.util';
import { loadSharp } from 'src/logic-functions/utils/load-sharp.util';

export const buildRecallBotAutomaticVideoOutput = async (): Promise<
  RecallBotAutomaticVideoOutput | undefined
> => {
  const style = getCallRecorderStyle();

  if (style === 'NONE') {
    return undefined;
  }

  try {
    const sharp = await loadSharp();

    const [fontFilePath, branding] = await Promise.all([
      getCameraTileFontFilePathOrThrow(),
      style === 'WORKSPACE' ? getWorkspaceBranding() : undefined,
    ]);

    const layout = await buildCameraTileLayout({
      sharp,
      style,
      branding,
      fontFilePath,
    });

    const background = isUndefined(layout.backgroundAssetPath)
      ? undefined
      : await fetchPublicAssetOrThrow(layout.backgroundAssetPath);

    const notRecordingImage = await buildBotImage({
      sharp,
      background,
      composites: layout.composites,
    });

    if (isUndefined(notRecordingImage)) {
      return undefined;
    }

    const recordingImage =
      (await buildBotImage({
        sharp,
        background,
        composites: [...layout.composites, ...layout.recordingComposites],
      })) ?? notRecordingImage;

    return {
      in_call_recording: { kind: 'jpeg', b64_data: recordingImage },
      in_call_not_recording: { kind: 'jpeg', b64_data: notRecordingImage },
    };
  } catch (error) {
    console.warn(
      `[call-recorder] failed to build the camera tile: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
