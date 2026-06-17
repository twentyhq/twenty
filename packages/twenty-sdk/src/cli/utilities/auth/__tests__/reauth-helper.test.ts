import inquirer from 'inquirer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authLoginOAuth } from '@/cli/operations/login-oauth';
import { promptForReauthentication } from '@/cli/utilities/auth/reauth-helper';

vi.mock('inquirer', () => ({ default: { prompt: vi.fn() } }));

vi.mock('@/cli/operations/login-oauth', () => ({ authLoginOAuth: vi.fn() }));

vi.mock('@/cli/utilities/config/config-service', () => ({
  ConfigService: class {
    getConfig = vi.fn().mockResolvedValue({ apiUrl: 'http://localhost:2020' });
  },
}));

describe('promptForReauthentication', () => {
  const originalIsTTY = process.stdout.isTTY;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.stdout.isTTY = originalIsTTY;
    vi.restoreAllMocks();
  });

  it('returns "non-interactive" without prompting when not attached to a TTY', async () => {
    process.stdout.isTTY = false;

    const outcome = await promptForReauthentication('local');

    expect(outcome).toBe('non-interactive');
    expect(inquirer.prompt).not.toHaveBeenCalled();
    expect(authLoginOAuth).not.toHaveBeenCalled();
  });

  it('returns "declined" when the user declines the prompt', async () => {
    process.stdout.isTTY = true;
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ proceed: false });

    const outcome = await promptForReauthentication('local');

    expect(outcome).toBe('declined');
    expect(authLoginOAuth).not.toHaveBeenCalled();
  });

  it('returns "reauthenticated" when the user accepts and login succeeds', async () => {
    process.stdout.isTTY = true;
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ proceed: true });
    vi.mocked(authLoginOAuth).mockResolvedValueOnce({
      success: true,
      data: undefined,
    });

    const outcome = await promptForReauthentication('local');

    expect(outcome).toBe('reauthenticated');
    expect(authLoginOAuth).toHaveBeenCalledWith({
      apiUrl: 'http://localhost:2020',
      remote: 'local',
    });
  });

  it('returns "declined" when the user accepts but login fails', async () => {
    process.stdout.isTTY = true;
    vi.mocked(inquirer.prompt).mockResolvedValueOnce({ proceed: true });
    vi.mocked(authLoginOAuth).mockResolvedValueOnce({
      success: false,
      error: { code: 'AUTH_FAILED', message: 'nope' },
    });

    const outcome = await promptForReauthentication('local');

    expect(outcome).toBe('declined');
  });
});
