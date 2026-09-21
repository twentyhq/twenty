import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as esbuild from 'esbuild';
import { FileFolder } from 'twenty-shared/types';

import { EsbuildWatcher } from '@/cli/utilities/build/common/esbuild-watcher';

vi.mock('esbuild', () => ({
  context: vi.fn(),
}));

vi.mock('@/cli/utilities/build/common/cleanup-removed-files', () => ({
  cleanupRemovedFiles: vi.fn(async () => {}),
}));

const contextMock = vi.mocked(esbuild.context);

const createWatcher = () =>
  new EsbuildWatcher({
    appPath: '/app',
    sourcePaths: [],
    watch: false,
    handleFileBuilt: vi.fn(),
    handleBuildError: vi.fn(),
    config: {
      externalModules: [],
      fileFolder: FileFolder.BuiltFrontComponent,
    },
  });

describe('EsbuildWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    contextMock.mockImplementation(async (options: esbuild.BuildOptions) => {
      const onEndCallbacks: ((result: esbuild.BuildResult) => void)[] = [];

      for (const plugin of options.plugins ?? []) {
        plugin.setup({
          onEnd: (callback: (result: esbuild.BuildResult) => void) => {
            onEndCallbacks.push(callback);
          },
        } as esbuild.PluginBuild);
      }

      return {
        rebuild: vi.fn(async () => {
          for (const callback of onEndCallbacks) {
            await callback({
              errors: [],
              metafile: { inputs: {}, outputs: {} },
            } as unknown as esbuild.BuildResult);
          }
        }),
        watch: vi.fn(async () => {}),
        dispose: vi.fn(async () => {}),
      } as unknown as esbuild.BuildContext;
    });
  });

  it('applies the last requested source paths exactly once when restarted during a restart', async () => {
    const watcher = createWatcher();

    await watcher.start();

    await Promise.all([
      watcher.restart(['a.front-component.tsx']),
      watcher.restart(['b.front-component.tsx']),
      watcher.restart(['c.front-component.tsx']),
    ]);

    expect(contextMock).toHaveBeenCalledTimes(2);

    const lastContextOptions = contextMock.mock.calls[1][0];

    expect(Object.keys(lastContextOptions.entryPoints ?? {})).toEqual([
      'c.front-component',
    ]);
    expect(watcher.shouldRestart(['c.front-component.tsx'])).toBe(false);
  });
});
