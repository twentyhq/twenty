import { execFileSync } from 'child_process';
import semver from 'semver';

import { synthesizeAppVersion } from '@/cli/utilities/version/synthesize-app-version';

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));

const execFileSyncMock = execFileSync as jest.Mock;

describe('synthesizeAppVersion', () => {
  const appPath = '/tmp/app';

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('produces a valid semver with the git short sha as build metadata', () => {
    execFileSyncMock.mockReturnValue('a1b2c3d\n');
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const version = synthesizeAppVersion({ appPath });

    expect(version).toBe('0.0.1700000000000+a1b2c3d');
    expect(semver.valid(version)).not.toBeNull();
  });

  it('omits build metadata when git is unavailable', () => {
    execFileSyncMock.mockImplementation(() => {
      throw new Error('not a git repository');
    });
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const version = synthesizeAppVersion({ appPath });

    expect(version).toBe('0.0.1700000000000');
    expect(semver.valid(version)).not.toBeNull();
  });

  it('generates strictly increasing versions over time (ignoring build metadata)', () => {
    execFileSyncMock.mockReturnValue('aaaaaaa\n');
    jest.spyOn(Date, 'now').mockReturnValueOnce(1_700_000_000_000);
    const earlier = synthesizeAppVersion({ appPath });

    execFileSyncMock.mockReturnValue('bbbbbbb\n');
    jest.spyOn(Date, 'now').mockReturnValueOnce(1_700_000_001_000);
    const later = synthesizeAppVersion({ appPath });

    expect(semver.gt(later, earlier)).toBe(true);
  });
});
