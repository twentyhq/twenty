import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildRecallBotAutomaticVideoOutput } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output.util';

const sharpMock = vi.hoisted(() => vi.fn());
const metadataQueryMock = vi.hoisted(() => vi.fn());

vi.mock('sharp', () => ({ default: sharpMock }));

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    query = metadataQueryMock;
  },
}));

const RECORDING_JPEG_BASE64 = Buffer.from('RECORDING_JPEG').toString('base64');
const PLAIN_JPEG_BASE64 = Buffer.from('PLAIN_JPEG').toString('base64');

const fetchMock = vi.fn();

let badgeBuildFails = false;
let jpegComposeFails = false;

type FakeSharpPipeline = {
  resize: () => FakeSharpPipeline;
  png: () => FakeSharpPipeline;
  jpeg: () => FakeSharpPipeline;
  composite: (composites: unknown[]) => FakeSharpPipeline;
  toBuffer: () => Promise<Buffer>;
};

const buildSharpPipeline = (
  produce: (composites: unknown[]) => Buffer,
): FakeSharpPipeline => {
  let appliedComposites: unknown[] = [];
  const pipeline: FakeSharpPipeline = {
    resize: () => pipeline,
    png: () => pipeline,
    jpeg: () => pipeline,
    composite: (composites) => {
      appliedComposites = composites;
      return pipeline;
    },
    toBuffer: async () => produce(appliedComposites),
  };

  return pipeline;
};

describe('buildRecallBotAutomaticVideoOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'true');
    vi.stubEnv('CALL_RECORDER_BOT_IMAGE_BACKGROUND', '#ffffff');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    badgeBuildFails = false;
    jpegComposeFails = false;
    metadataQueryMock.mockResolvedValue({
      currentWorkspace: {
        logo: 'https://files.example.com/workspace-logo.png',
      },
    });
    fetchMock.mockResolvedValue(
      new Response(Buffer.from('logo'), { status: 200 }),
    );
    sharpMock.mockImplementation((input?: unknown) => {
      if (Buffer.isBuffer(input) && input.toString('utf8').startsWith('<svg')) {
        return buildSharpPipeline(() => {
          if (badgeBuildFails) {
            throw new Error('badge rendering failed');
          }

          return Buffer.from('BADGE_PNG');
        });
      }

      if (Buffer.isBuffer(input)) {
        return buildSharpPipeline(() => Buffer.from('LOGO_PNG'));
      }

      return buildSharpPipeline((composites) => {
        if (jpegComposeFails) {
          throw new Error('jpeg composition failed');
        }

        return Buffer.from(
          composites.length > 1 ? 'RECORDING_JPEG' : 'PLAIN_JPEG',
        );
      });
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('badges the recording state and leaves the not-recording state plain', async () => {
    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toEqual({
      in_call_recording: { kind: 'jpeg', b64_data: RECORDING_JPEG_BASE64 },
      in_call_not_recording: { kind: 'jpeg', b64_data: PLAIN_JPEG_BASE64 },
    });
  });

  it('falls back to the plain image when the badged variant fails', async () => {
    badgeBuildFails = true;

    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toEqual({
      in_call_recording: { kind: 'jpeg', b64_data: PLAIN_JPEG_BASE64 },
      in_call_not_recording: { kind: 'jpeg', b64_data: PLAIN_JPEG_BASE64 },
    });
  });

  it('returns undefined when the feature is disabled', async () => {
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');

    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toBeUndefined();
    expect(metadataQueryMock).not.toHaveBeenCalled();
  });

  it('returns undefined when no workspace logo is set', async () => {
    metadataQueryMock.mockResolvedValue({ currentWorkspace: { logo: null } });

    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toBeUndefined();
    expect(sharpMock).not.toHaveBeenCalled();
  });

  it('returns undefined when the image cannot be built', async () => {
    jpegComposeFails = true;

    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toBeUndefined();
  });
});
