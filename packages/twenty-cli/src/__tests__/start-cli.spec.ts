import { afterEach, describe, expect, it, vi } from 'vitest';

import { engines } from '../../package.json';

import { startCli } from '@/start-cli';

describe('startCli', () => {
  afterEach(() => {
    process.exitCode = undefined;
    vi.restoreAllMocks();
  });

  it('runs the loaded CLI with the command line arguments', async () => {
    const runCli = vi.fn(async () => undefined);

    await startCli({
      args: ['version'],
      nodeVersion: process.versions.node,
      loadCli: async () => ({ runCli }),
    });

    expect(runCli).toHaveBeenCalledWith(['version']);
  });

  it('explains the Node requirement when the CLI cannot load on an unsupported Node', async () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    await startCli({
      args: ['version'],
      nodeVersion: '18.17.1',
      loadCli: async () => {
        throw new Error('crypto.getRandomValues() not supported.');
      },
    });

    expect(stderr).toHaveBeenCalledWith(
      `twenty requires Node.js ${engines.node}; this is Node.js 18.17.1. Switch to a supported Node.js version, then try again.\n`,
    );
    expect(process.exitCode).toBe(1);
  });

  it('keeps load failures on a supported Node visible', async () => {
    await expect(
      startCli({
        args: ['version'],
        nodeVersion: process.versions.node,
        loadCli: async () => {
          throw new Error('broken bundle');
        },
      }),
    ).rejects.toThrow('broken bundle');
  });
});
