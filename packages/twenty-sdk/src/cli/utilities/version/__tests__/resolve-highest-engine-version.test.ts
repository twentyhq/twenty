import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getEngineVersionRange } from '@/cli/utilities/version/get-engine-version-range';
import { getPublishedServerVersions } from '@/cli/utilities/version/get-published-server-versions';
import { resolveHighestEngineVersion } from '@/cli/utilities/version/resolve-highest-engine-version';

vi.mock('@/cli/utilities/version/get-engine-version-range');
vi.mock('@/cli/utilities/version/get-published-server-versions');

const mockedGetRange = vi.mocked(getEngineVersionRange);
const mockedGetPublished = vi.mocked(getPublishedServerVersions);

const publish = (...names: string[]) =>
  mockedGetPublished.mockResolvedValue(
    names.map((name) => ({ name, lastUpdatedAt: new Date(0) })),
  );

describe('resolveHighestEngineVersion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetRange.mockReturnValue(null);
    mockedGetPublished.mockResolvedValue([]);
  });

  it('returns the explicit version verbatim without resolving', async () => {
    expect(await resolveHighestEngineVersion('2.3.1')).toBe('2.3.1');
    expect(mockedGetRange).not.toHaveBeenCalled();
    expect(mockedGetPublished).not.toHaveBeenCalled();
  });

  it('trims the explicit version', async () => {
    expect(await resolveHighestEngineVersion('  2.3.1  ')).toBe('2.3.1');
  });

  it('falls through to the app range when the explicit version is blank', async () => {
    mockedGetRange.mockReturnValue('>=2.2.0');
    publish('2.2.0', '2.3.0');

    expect(await resolveHighestEngineVersion('   ')).toBe('2.3.0');
  });

  it('returns latest when the app declares no range', async () => {
    mockedGetRange.mockReturnValue(null);

    expect(await resolveHighestEngineVersion()).toBe('latest');
    expect(mockedGetPublished).not.toHaveBeenCalled();
  });

  it('returns latest when the range is not a valid semver range', async () => {
    mockedGetRange.mockReturnValue('not-a-range');

    expect(await resolveHighestEngineVersion()).toBe('latest');
    expect(mockedGetPublished).not.toHaveBeenCalled();
  });

  it('returns the highest published version satisfying the range', async () => {
    mockedGetRange.mockReturnValue('^2.2.0');
    publish('2.1.9', '2.2.0', '2.2.5', '2.3.0', '3.0.0', 'latest');

    expect(await resolveHighestEngineVersion()).toBe('2.3.0');
  });

  it('returns latest when no published version satisfies the range', async () => {
    mockedGetRange.mockReturnValue('>=9.0.0');
    publish('2.2.0', '2.3.0');

    expect(await resolveHighestEngineVersion()).toBe('latest');
  });

  it('returns latest when no versions are published', async () => {
    mockedGetRange.mockReturnValue('>=2.2.0');
    mockedGetPublished.mockResolvedValue([]);

    expect(await resolveHighestEngineVersion()).toBe('latest');
  });
});
