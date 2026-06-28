import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildRecallBotAutomaticVideoOutput } from 'src/logic-functions/domain/build-recall-bot-automatic-video-output.util';

const isEnabledMock = vi.hoisted(() => vi.fn());
const getBackgroundMock = vi.hoisted(() => vi.fn());
const getWorkspaceLogoMock = vi.hoisted(() => vi.fn());
const buildBotImageMock = vi.hoisted(() => vi.fn());

vi.mock(
  'src/logic-functions/constants/is-workspace-logo-bot-image-enabled',
  () => ({ isWorkspaceLogoBotImageEnabled: isEnabledMock }),
);

vi.mock('src/logic-functions/constants/get-bot-image-background', () => ({
  getBotImageBackground: getBackgroundMock,
}));

vi.mock('src/logic-functions/data/get-workspace-logo.util', () => ({
  getWorkspaceLogo: getWorkspaceLogoMock,
}));

vi.mock('src/logic-functions/domain/build-bot-image.util', () => ({
  buildBotImage: buildBotImageMock,
}));

describe('buildRecallBotAutomaticVideoOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isEnabledMock.mockReturnValue(true);
    getBackgroundMock.mockReturnValue('#ffffff');
    getWorkspaceLogoMock.mockResolvedValue({
      buffer: Buffer.from('logo'),
      contentType: 'image/png',
    });
    buildBotImageMock.mockResolvedValue('BASE64JPEG');
  });

  it('sets the same JPEG frame for both bot states', async () => {
    const result = await buildRecallBotAutomaticVideoOutput();

    const expectedFrame = { kind: 'jpeg', b64_data: 'BASE64JPEG' };

    expect(result).toEqual({
      in_call_recording: expectedFrame,
      in_call_not_recording: expectedFrame,
    });
  });

  it('returns undefined when the feature is disabled', async () => {
    isEnabledMock.mockReturnValue(false);

    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toBeUndefined();
    expect(getWorkspaceLogoMock).not.toHaveBeenCalled();
  });

  it('returns undefined when no workspace logo is set', async () => {
    getWorkspaceLogoMock.mockResolvedValue(undefined);

    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toBeUndefined();
    expect(buildBotImageMock).not.toHaveBeenCalled();
  });

  it('returns undefined when the image cannot be built', async () => {
    buildBotImageMock.mockResolvedValue(undefined);

    const result = await buildRecallBotAutomaticVideoOutput();

    expect(result).toBeUndefined();
  });
});
