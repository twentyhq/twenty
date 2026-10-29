import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { installAppDependencies } from '@/app/install-app-dependencies';

const output = {
  event: vi.fn(),
  warn: vi.fn(),
  progress: vi.fn(),
  succeed: vi.fn(),
  fail: vi.fn(),
};

describe('installing a new pull project', () => {
  let appPath: string;
  const writeYarn = (source: string) =>
    writeFile(join(appPath, 'yarn'), `#!${process.execPath}\n${source}`, {
      mode: 0o755,
    });

  beforeEach(async () => {
    appPath = await mkdtemp(join(tmpdir(), 'twenty-pull-install-'));
    vi.stubEnv('PATH', appPath);
    vi.stubEnv('TWENTY_API_KEY', 'workspace-secret');
    vi.stubEnv('TWENTY_APP_ACCESS_TOKEN', 'app-secret');
    vi.stubEnv('TWENTY_API_URL', 'https://workspace.invalid');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(appPath, { recursive: true, force: true });
  });

  it('installs in the new project without exposing workspace credentials or subprocess output', async () => {
    await writeYarn(`
      require('node:fs').writeFileSync('installation.json', JSON.stringify({
        args: process.argv.slice(2),
        hasCredentials: Boolean(process.env.TWENTY_API_KEY || process.env.TWENTY_APP_ACCESS_TOKEN || process.env.TWENTY_API_URL),
        immutable: process.env.YARN_ENABLE_IMMUTABLE_INSTALLS,
      }));
      console.log('package manager output');
    `);

    await installAppDependencies({
      appPath,
      output,
      signal: new AbortController().signal,
    });

    expect(
      JSON.parse(await readFile(join(appPath, 'installation.json'), 'utf8')),
    ).toEqual({
      args: ['install'],
      hasCredentials: false,
      immutable: 'false',
    });
  });

  it('reports install failure with the retained project and package manager diagnostics', async () => {
    await writeYarn(
      `console.error('Registry unavailable'); process.exitCode = 9;`,
    );

    await expect(
      installAppDependencies({
        appPath,
        output,
        signal: new AbortController().signal,
      }),
    ).rejects.toMatchObject({
      code: 'APP_INIT_FAILED',
      hint: expect.stringContaining('Registry unavailable'),
      details: {
        path: appPath,
        exitCode: 9,
        stderr: expect.stringContaining('Registry unavailable'),
      },
    });
  });

  it('stops the installer when pull is cancelled', async () => {
    await writeYarn(
      `require('node:fs').writeFileSync('started', 'yes'); setInterval(() => {}, 1000);`,
    );
    const cancellation = new AbortController();
    const installation = installAppDependencies({
      appPath,
      output,
      signal: cancellation.signal,
    });
    const rejected = expect(installation).rejects.toMatchObject({
      code: 'CANCELLED',
    });

    await vi.waitFor(() => access(join(appPath, 'started')));
    cancellation.abort();
    await rejected;
  });
});
