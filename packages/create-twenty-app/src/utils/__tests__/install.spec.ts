import { exec } from 'child_process';

import { TEMPLATE_FIRST_PARTY_PACKAGES } from '@/constants/template-packages';
import { install } from '@/utils/install';
import createTwentyAppPackageJson from 'package.json';

jest.mock('child_process', () => ({ exec: jest.fn() }));

const execMock = exec as unknown as jest.Mock;

type CommandOutcome = { stdout?: string; stderr?: string; fails?: boolean };

const mockCommands = (outcomes: Record<string, CommandOutcome>) => {
  execMock.mockImplementation(
    (
      command: string,
      _options: unknown,
      callback: (error: Error | null, stdout?: string) => void,
    ) => {
      const outcome =
        Object.entries(outcomes).find(([prefix]) =>
          command.startsWith(prefix),
        )?.[1] ?? {};

      if (outcome.fails !== true) {
        callback(null, outcome.stdout ?? '');
        return;
      }

      const error = Object.assign(new Error(`Command failed: ${command}`), {
        stdout: outcome.stdout ?? '',
        stderr: outcome.stderr ?? '',
      });

      callback(error);
    },
  );
};

const APP_DIRECTORY = '/tmp/some-scaffolded-app';

describe('install', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('installs without immutable mode so the template lockfile can be finalised', async () => {
    mockCommands({});

    await install(APP_DIRECTORY);

    expect(execMock).toHaveBeenCalledWith(
      'yarn install --no-immutable',
      { cwd: APP_DIRECTORY },
      expect.any(Function),
    );
  });

  it('reports the failure instead of leaving a project without dependencies', async () => {
    mockCommands({
      'yarn install': { fails: true, stdout: 'YN0001: Something exploded' },
    });

    await expect(install(APP_DIRECTORY)).rejects.toThrow(
      /Dependency installation failed/,
    );
  });

  it('explains how to proceed when a minimum release age quarantines the packages', async () => {
    mockCommands({
      'yarn install': {
        fails: true,
        stdout: `➤ YN0016: │ twenty-ui@npm:${createTwentyAppPackageJson.version}: All versions satisfying "${createTwentyAppPackageJson.version}" are quarantined`,
      },
    });

    const error = await install(APP_DIRECTORY).catch(
      (thrown: Error) => thrown.message,
    );

    expect(error).toContain('minimum');
    expect(error).toContain(APP_DIRECTORY);
    expect(error).toContain('npmPreapprovedPackages');

    // The suggested waiver must be scoped to the packages this release pins,
    // never a blanket instruction to lower the gate.
    for (const packageName of TEMPLATE_FIRST_PARTY_PACKAGES) {
      expect(error).toContain(
        `${packageName}@${createTwentyAppPackageJson.version}`,
      );
    }
    expect(error).not.toContain('npmMinimalAgeGate: 0');
  });

  it('tolerates corepack being unavailable when yarn still installs', async () => {
    mockCommands({ 'corepack enable': { fails: true, stderr: 'no corepack' } });

    await expect(install(APP_DIRECTORY)).resolves.toBeUndefined();
  });
});
