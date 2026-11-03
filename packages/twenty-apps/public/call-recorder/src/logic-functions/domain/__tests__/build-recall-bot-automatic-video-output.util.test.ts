import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CAMERA_TILE_FONT_ASSET_PATH,
  CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS,
  CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
} from 'src/logic-functions/constants/camera-tile-asset-paths';
import {
  RECALL_BOT_IMAGE_HEIGHT,
  RECALL_BOT_IMAGE_MAX_BYTES,
  RECALL_BOT_IMAGE_WIDTH,
} from 'src/logic-functions/constants/recall-bot-image-config';

const metadataQueryMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-sdk/utils', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getPublicAssetUrl: (path: string) => `https://assets.test/${path}`,
}));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQueryMock;
  },
}));

const ASSET_URL_PREFIX = 'https://assets.test/';
const LOGO_URL = 'https://files.test/workspace-logo.png';
const PUBLIC_DIRECTORY = join(__dirname, '..', '..', '..', '..', 'public');

const fetchMock = vi.fn();

const requestedAssetPaths = () =>
  fetchMock.mock.calls
    .map(([url]) => String(url))
    .filter((url) => url.startsWith(ASSET_URL_PREFIX))
    .map((url) => url.slice(ASSET_URL_PREFIX.length));

const readFrameMetadata = (base64: string) =>
  sharp(Buffer.from(base64, 'base64')).metadata();

const readPublicAssetAsBase64 = async (path: string) =>
  (await readFile(join(PUBLIC_DIRECTORY, path))).toString('base64');

const buildOutput = async () => {
  const { buildRecallBotAutomaticVideoOutput } =
    await import('src/logic-functions/domain/build-recall-bot-automatic-video-output.util');

  return buildRecallBotAutomaticVideoOutput();
};

describe('buildRecallBotAutomaticVideoOutput', () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('fetch', fetchMock);

    const logo = await sharp({
      create: { width: 64, height: 64, channels: 3, background: '#f25f29' },
    })
      .png()
      .toBuffer();

    fetchMock.mockImplementation(async (url: string) =>
      url.startsWith(ASSET_URL_PREFIX)
        ? new Response(
            await readFile(
              join(PUBLIC_DIRECTORY, url.slice(ASSET_URL_PREFIX.length)),
            ),
          )
        : new Response(logo),
    );
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: { logo: LOGO_URL, displayName: 'Acme Inc.' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sends no image for the None style', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'NONE');

    expect(await buildOutput()).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(['TWENTY', 'MINIMAL'] as const)(
    'sends the prebuilt %s frames without rendering',
    async (style) => {
      vi.stubEnv('CALL_RECORDER_STYLE', style);
      const assetPaths = CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS[style];

      expect(await buildOutput()).toEqual({
        in_call_recording: {
          kind: 'jpeg',
          b64_data: await readPublicAssetAsBase64(assetPaths.recording),
        },
        in_call_not_recording: {
          kind: 'jpeg',
          b64_data: await readPublicAssetAsBase64(assetPaths.notRecording),
        },
      });
      expect(requestedAssetPaths()).not.toContain(CAMERA_TILE_FONT_ASSET_PATH);
      expect(metadataQueryMock).not.toHaveBeenCalled();
    },
  );

  it('defaults to the Twenty style when the variable is unset', async () => {
    expect(await buildOutput()).toBeDefined();
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS.TWENTY.notRecording,
    );
  });

  it.each(
    Object.values(CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS).flatMap(
      ({ recording, notRecording }) => [recording, notRecording],
    ),
  )('ships %s as a frame Recall accepts', async (path) => {
    const frame = await readFile(join(PUBLIC_DIRECTORY, path));

    expect(frame.byteLength).toBeLessThanOrEqual(RECALL_BOT_IMAGE_MAX_BYTES);
    expect(await sharp(frame).metadata()).toMatchObject({
      format: 'jpeg',
      width: RECALL_BOT_IMAGE_WIDTH,
      height: RECALL_BOT_IMAGE_HEIGHT,
    });
  });

  it('renders distinct 1280x720 workspace frames for the recording states', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');

    const output = await buildOutput();

    expect(output?.in_call_recording.b64_data).not.toEqual(
      output?.in_call_not_recording.b64_data,
    );

    for (const frame of [
      output?.in_call_recording,
      output?.in_call_not_recording,
    ]) {
      expect(frame?.kind).toBe('jpeg');
      expect(await readFrameMetadata(frame?.b64_data ?? '')).toMatchObject({
        format: 'jpeg',
        width: RECALL_BOT_IMAGE_WIDTH,
        height: RECALL_BOT_IMAGE_HEIGHT,
      });
    }
    expect(fetchMock).toHaveBeenCalledWith(LOGO_URL, expect.anything());
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
    );
  });

  it('renders a workspace name wider than the safe zone', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: {
        logo: LOGO_URL,
        displayName:
          'A workspace name long enough to overflow the camera tile on its own line',
      },
    });

    const output = await buildOutput();

    expect(output).toBeDefined();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('keeps the workspace name when the logo download fails', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');
    const assetFetch = fetchMock.getMockImplementation();

    fetchMock.mockImplementation(async (url: string) => {
      if (url === LOGO_URL) {
        throw new Error('logo download timed out');
      }

      return assetFetch?.(url);
    });

    expect(await buildOutput()).toBeDefined();
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
    );
  });

  it('falls back to the Twenty style when the workspace has neither a logo nor a drawable name', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: { logo: null, displayName: '日本商事' },
    });

    expect(await buildOutput()).toBeDefined();
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS.TWENTY.notRecording,
    );
    expect(requestedAssetPaths()).not.toContain(
      CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
    );
  });

  it('falls back to the Twenty frames when the workspace tile fails', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');
    const assetFetch = fetchMock.getMockImplementation();

    fetchMock.mockImplementation(async (url: string) =>
      url.endsWith(CAMERA_TILE_FONT_ASSET_PATH)
        ? new Response(null, { status: 503 })
        : assetFetch?.(url),
    );

    expect(await buildOutput()).toEqual({
      in_call_recording: {
        kind: 'jpeg',
        b64_data: await readPublicAssetAsBase64(
          CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS.TWENTY.recording,
        ),
      },
      in_call_not_recording: {
        kind: 'jpeg',
        b64_data: await readPublicAssetAsBase64(
          CAMERA_TILE_PREBUILT_FRAME_ASSET_PATHS.TWENTY.notRecording,
        ),
      },
    });
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it('falls back to the plain frame when the recording frame fails', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');
    vi.doMock('src/logic-functions/domain/build-bot-image.util', () => ({
      buildBotImage: vi
        .fn()
        .mockResolvedValueOnce('PLAIN_FRAME')
        .mockRejectedValueOnce(new Error('encode failed')),
    }));

    expect(await buildOutput()).toEqual({
      in_call_recording: { kind: 'jpeg', b64_data: 'PLAIN_FRAME' },
      in_call_not_recording: { kind: 'jpeg', b64_data: 'PLAIN_FRAME' },
    });
    expect(console.warn).toHaveBeenCalledOnce();

    vi.doUnmock('src/logic-functions/domain/build-bot-image.util');
  });

  it('sends no image when an asset cannot be downloaded', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'TWENTY');
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    expect(await buildOutput()).toBeUndefined();
  });
});
