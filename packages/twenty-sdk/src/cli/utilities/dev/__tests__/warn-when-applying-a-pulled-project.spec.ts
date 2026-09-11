import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { warnWhenApplyingAPulledProject } from '@/cli/utilities/dev/warn-when-applying-a-pulled-project';
import { hasPullBaseFile } from '@/cli/utilities/pull/pull-base-file';

vi.mock('@/cli/utilities/pull/pull-base-file', () => ({
  hasPullBaseFile: vi.fn(),
}));

const mockedHasPullBaseFile = vi.mocked(hasPullBaseFile);

const APP_PATH = '/tmp/pulled-app';

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined);
  mockedHasPullBaseFile.mockResolvedValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
  mockedHasPullBaseFile.mockReset();
});

describe('warnWhenApplyingAPulledProject', () => {
  it('should warn when applying a pulled project with deletion inference on', async () => {
    await warnWhenApplyingAPulledProject({
      appPath: APP_PATH,
      isApplying: true,
      infersDeletionFromMissingEntities: true,
    });

    expect(console.log).toHaveBeenCalled();
    expect(vi.mocked(console.log).mock.calls.join('\n')).toContain(
      '--no-delete',
    );
  });

  it('should stay silent when the run keeps entities missing from the source', async () => {
    await warnWhenApplyingAPulledProject({
      appPath: APP_PATH,
      isApplying: true,
      infersDeletionFromMissingEntities: false,
    });

    expect(console.log).not.toHaveBeenCalled();
    expect(mockedHasPullBaseFile).not.toHaveBeenCalled();
  });

  it('should stay silent when only planning', async () => {
    await warnWhenApplyingAPulledProject({
      appPath: APP_PATH,
      isApplying: false,
      infersDeletionFromMissingEntities: true,
    });

    expect(console.log).not.toHaveBeenCalled();
    expect(mockedHasPullBaseFile).not.toHaveBeenCalled();
  });

  it('should stay silent for a project that was never pulled into', async () => {
    mockedHasPullBaseFile.mockResolvedValue(false);

    await warnWhenApplyingAPulledProject({
      appPath: APP_PATH,
      isApplying: true,
      infersDeletionFromMissingEntities: true,
    });

    expect(console.log).not.toHaveBeenCalled();
  });
});
