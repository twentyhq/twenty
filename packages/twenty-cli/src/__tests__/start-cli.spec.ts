import { afterEach, describe, expect, it, vi } from 'vitest';

import { CLI_NODE_VERSION_RANGE } from '@/constants/cli-node-version-range.constant';
import { startCli } from '@/start-cli';

describe('startCli', () => {
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it.each(['24.5.0', '24.12.0', '25.0.0', '26.0.0'])(
    'runs the loaded CLI on supported Node %s',
    async (nodeVersion) => {
      const runCli = vi.fn(async () => undefined);

      await startCli({
        args: ['version'],
        nodeVersion,
        loadCli: async () => ({ runCli }),
      });

      expect(runCli).toHaveBeenCalledTimes(1);
      expect(runCli).toHaveBeenCalledWith(['version']);
    },
  );

  it.each(['18.17.1', '22.12.0', '24.4.1'])(
    'rejects unsupported Node %s before loading the CLI',
    async (nodeVersion) => {
      const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
      const runCli = vi.fn(async () => undefined);
      const loadCli = vi.fn(async () => ({ runCli }));

      await startCli({ args: ['version'], nodeVersion, loadCli });

      expect(stderr).toHaveBeenCalledWith(
        `twenty requires Node.js ${CLI_NODE_VERSION_RANGE}; this is Node.js ${nodeVersion}. Switch to a supported Node.js version, then try again.\n`,
      );
      expect(process.exitCode).toBe(1);
      expect(loadCli).not.toHaveBeenCalled();
      expect(runCli).not.toHaveBeenCalled();
    },
  );

  it('keeps load failures on a supported Node visible', async () => {
    await expect(
      startCli({
        args: ['version'],
        nodeVersion: '24.5.0',
        loadCli: async () => {
          throw new Error('broken bundle');
        },
      }),
    ).rejects.toThrow('broken bundle');
  });
});
