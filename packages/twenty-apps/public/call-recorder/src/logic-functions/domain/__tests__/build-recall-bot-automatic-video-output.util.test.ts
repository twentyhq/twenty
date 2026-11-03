import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
  CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
} from 'src/logic-functions/constants/camera-tile-asset-paths';

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

const decodeFrame = (base64: string) =>
  sharp(Buffer.from(base64, 'base64')).metadata();

const buildOutput = async () => {
  const { buildRecallBotAutomaticVideoOutput } = await import(
    'src/logic-functions/domain/build-recall-bot-automatic-video-output.util'
  );

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

  it('renders distinct 1280x720 frames for the recording states', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'TWENTY');

    const output = await buildOutput();

    expect(output).toBeDefined();
    expect(output?.in_call_recording.b64_data).not.toEqual(
      output?.in_call_not_recording.b64_data,
    );

    for (const frame of [
      output?.in_call_recording,
      output?.in_call_not_recording,
    ]) {
      expect(frame?.kind).toBe('jpeg');
      expect(await decodeFrame(frame?.b64_data ?? '')).toMatchObject({
        format: 'jpeg',
        width: 1280,
        height: 720,
      });
    }
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
    );
  });

  it('defaults to the Twenty style when the variable is unset', async () => {
    expect(await buildOutput()).toBeDefined();
    expect(metadataQueryMock).not.toHaveBeenCalled();
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
    );
  });

  it('draws the workspace logo and name on the workspace background', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');

    expect(await buildOutput()).toBeDefined();
    expect(fetchMock).toHaveBeenCalledWith(LOGO_URL, expect.anything());
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
    );
  });

  it('shrinks a workspace name wider than the tile to fit', async () => {
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

  it('falls back to the Twenty style when the workspace has neither a logo nor a drawable name', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'WORKSPACE');
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: { logo: null, displayName: '日本商事' },
    });

    expect(await buildOutput()).toBeDefined();
    expect(requestedAssetPaths()).toContain(
      CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
    );
    expect(requestedAssetPaths()).not.toContain(
      CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
    );
  });

  it('draws the minimal style without a background asset', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'MINIMAL');

    expect(await buildOutput()).toBeDefined();
    expect(requestedAssetPaths()).not.toContain(
      CAMERA_TILE_TWENTY_BACKGROUND_ASSET_PATH,
    );
    expect(requestedAssetPaths()).not.toContain(
      CAMERA_TILE_WORKSPACE_BACKGROUND_ASSET_PATH,
    );
  });

  it('sends no image when an asset cannot be downloaded', async () => {
    vi.stubEnv('CALL_RECORDER_STYLE', 'TWENTY');
    fetchMock.mockResolvedValue(new Response(null, { status: 503 }));

    expect(await buildOutput()).toBeUndefined();
  });
});
