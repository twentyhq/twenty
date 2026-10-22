import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  setup,
  teardown,
} from '../../../app-template/src/__tests__/global-setup';
import { runTwenty } from '../../../app-template/src/__tests__/run-twenty';

vi.mock('../../../app-template/src/__tests__/run-twenty', () => ({
  runTwenty: vi.fn(),
}));

const notInstalled = {
  ok: false,
  error: { code: 'APP_NOT_INSTALLED', message: 'Not installed.' },
} as const;

const uninstallFailed = {
  ok: false,
  error: { code: 'PERMISSION_DENIED', message: 'Cannot uninstall.' },
} as const;

describe('app template integration setup', () => {
  beforeEach(() => {
    vi.mocked(runTwenty).mockReset();
    vi.stubEnv('TWENTY_API_URL', 'http://localhost:2020');
    vi.stubEnv('TWENTY_API_KEY', 'test-key');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('installs the app when there is no previous installation to clean up', async () => {
    vi.mocked(runTwenty)
      .mockResolvedValueOnce(notInstalled)
      .mockResolvedValueOnce({ ok: true, data: {} });

    await setup();

    expect(runTwenty).toHaveBeenNthCalledWith(1, ['app', 'uninstall', '--yes']);
    expect(runTwenty).toHaveBeenNthCalledWith(2, ['app', 'apply', '--create']);
  });

  it('does not apply the app when cleanup fails', async () => {
    vi.mocked(runTwenty).mockResolvedValue(uninstallFailed);

    await expect(setup()).rejects.toThrow(
      'PERMISSION_DENIED Cannot uninstall.',
    );
    expect(runTwenty).toHaveBeenCalledExactlyOnceWith([
      'app',
      'uninstall',
      '--yes',
    ]);
  });

  it('surfaces uninstall failures during teardown', async () => {
    vi.mocked(runTwenty).mockResolvedValue(uninstallFailed);

    await expect(teardown()).rejects.toThrow(
      'PERMISSION_DENIED Cannot uninstall.',
    );
  });

  it('allows teardown after the app was already uninstalled', async () => {
    vi.mocked(runTwenty).mockResolvedValue(notInstalled);

    await expect(teardown()).resolves.toBeUndefined();
  });
});
