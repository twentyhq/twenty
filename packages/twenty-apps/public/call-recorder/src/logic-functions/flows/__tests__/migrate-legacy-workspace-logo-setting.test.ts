import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { migrateLegacyWorkspaceLogoSetting } from 'src/logic-functions/flows/migrate-legacy-workspace-logo-setting.util';

const metadataMutationMock = vi.hoisted(() => vi.fn());

vi.mock('twenty-client-sdk/metadata', () => ({
  MetadataApiClient: class {
    mutation = metadataMutationMock;
  },
}));

const expectStyleSavedAs = (style: string) =>
  expect(metadataMutationMock).toHaveBeenCalledWith({
    updateOneApplicationVariable: {
      __args: { key: 'CALL_RECORDER_STYLE', value: style },
    },
  });

describe('migrateLegacyWorkspaceLogoSetting', () => {
  beforeEach(() => {
    metadataMutationMock.mockReset();
    metadataMutationMock.mockResolvedValue({
      updateOneApplicationVariable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('keeps the workspace logo for workspaces that showed it', async () => {
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'true');

    expect(await migrateLegacyWorkspaceLogoSetting('1.19.0')).toBe('WORKSPACE');
    expectStyleSavedAs('WORKSPACE');
  });

  it('treats an unset legacy toggle as the old default, which showed the logo', async () => {
    expect(await migrateLegacyWorkspaceLogoSetting('1.19.0')).toBe('WORKSPACE');
    expectStyleSavedAs('WORKSPACE');
  });

  it('keeps the image off for workspaces that turned the logo off', async () => {
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');

    expect(await migrateLegacyWorkspaceLogoSetting('1.12.3')).toBe('NONE');
    expectStyleSavedAs('NONE');
  });

  it('leaves the style alone when upgrading from a version that already had styles', async () => {
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');

    expect(await migrateLegacyWorkspaceLogoSetting('1.20.0')).toBeUndefined();
    expect(metadataMutationMock).not.toHaveBeenCalled();
  });

  it('keeps a style that is already set, so a retried hook cannot overwrite it', async () => {
    vi.stubEnv('CALL_RECORDER_USE_WORKSPACE_LOGO', 'false');
    vi.stubEnv('CALL_RECORDER_STYLE', 'MINIMAL');

    expect(await migrateLegacyWorkspaceLogoSetting('1.19.0')).toBeUndefined();
    expect(metadataMutationMock).not.toHaveBeenCalled();
  });

  it('surfaces a failed save so the install hook can retry', async () => {
    metadataMutationMock.mockRejectedValue(new Error('network down'));

    await expect(migrateLegacyWorkspaceLogoSetting('1.19.0')).rejects.toThrow(
      'network down',
    );
  });
});
