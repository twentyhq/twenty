import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { afterEach, expect, it, vi } from 'vitest';
import { getAppInitNextSteps } from '@/app/get-app-init-next-steps';

it.skipIf(process.platform === 'win32')(
  'prints a runnable cd for a leading-dash folder',
  async () => {
    const root = await mkdtemp(join(tmpdir(), 'next-step-'));
    try {
      await mkdir(join(root, '-app'));
      const steps = getAppInitNextSteps({
        displayPath: '-app',
        isTargetConfigured: true,
        remoteName: undefined,
      });
      const { stdout } = await promisify(execFile)(
        'sh',
        ['-c', steps[0].command + '\npwd -P'],
        { cwd: root },
      );
      expect(stdout.trim()).toBe(await realpath(join(root, '-app')));
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

afterEach(() => vi.unstubAllGlobals());

it('labels Windows steps as PowerShell and escapes apostrophes literally', () => {
  vi.stubGlobal('process', { ...process, platform: 'win32' });
  const steps = getAppInitNextSteps({
    displayPath: "C:\\apps\\O'Brien app",
    isTargetConfigured: true,
    remoteName: "O'Brien workspace",
  });
  expect(steps[0].command).toBe("cd 'C:\\apps\\O''Brien app'");
  expect(steps.at(-1)?.command).toBe(
    "twenty app apply --create --remote 'O''Brien workspace'",
  );
  expect(steps.every((step) => step.description.endsWith('(PowerShell)'))).toBe(
    true,
  );
});
