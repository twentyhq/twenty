import { describe, expect, it } from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import { CLI_VERSION } from '@/constants/cli-version.constant';

const JSON_MODE_INVOCATIONS = [
  ['version', '--json'],
  ['commands', '--json'],
  ['--json'],
  ['--json', '--version'],
  ['version', '--help', '--json'],
  ['versoin', '--json'],
  ['help', 'versoin', '--json'],
  ['version', '--jsn', '--json'],
  ['version', 'extra', '--json'],
  ['app:publish', '--json'],
  ['--json', '--format', 'ndjson', 'version'],
  ['--format', 'xml', '--json', 'version'],
];

describe('runCli', () => {
  it.each(JSON_MODE_INVOCATIONS.map((args) => [args]))(
    'prints exactly one JSON envelope for %j',
    async (args) => {
      const { stdout } = await runCliForTest(args);
      const envelope = parseSingleJsonLine(stdout);

      expect(envelope).toMatchObject({
        schemaVersion: 1,
        ok: expect.any(Boolean),
        warnings: expect.any(Array),
      });
    },
  );

  it('prints version information', async () => {
    const { stdout, exitCode } = await runCliForTest(['version', '--json']);

    expect(exitCode).toBe(0);
    expect(parseSingleJsonLine(stdout)).toMatchObject({
      ok: true,
      command: 'version',
      data: { version: CLI_VERSION, node: process.versions.node },
    });
  });

  it('renders --version like the version command', async () => {
    const { stdout, exitCode } = await runCliForTest(['--version']);

    expect(exitCode).toBe(0);
    expect(stdout).toMatch(new RegExp(`^twenty ${CLI_VERSION} `));
  });

  it('lists the available commands', async () => {
    const { stdout } = await runCliForTest(['commands', '--json']);
    const names = parseSingleJsonLine(stdout).data.commands.map(
      (command: { name: string }) => command.name,
    );

    expect(names).toEqual(expect.arrayContaining(['commands', 'version']));
  });

  it('shows help without a command and exits successfully', async () => {
    const { stdout, exitCode } = await runCliForTest(['--json']);
    const envelope = parseSingleJsonLine(stdout);

    expect(exitCode).toBe(0);
    expect(envelope.data.help).toContain('Usage: twenty');
  });

  it('rejects unknown commands with a suggestion and exit code 2', async () => {
    const { stdout, exitCode } = await runCliForTest(['versoin', '--json']);
    const envelope = parseSingleJsonLine(stdout);

    expect(exitCode).toBe(2);
    expect(envelope.ok).toBe(false);
    expect(envelope.error.code).toBe('USAGE');
    expect(envelope.error.message).toContain('Did you mean version?');
  });

  it('rejects help for an unknown command', async () => {
    const { stdout, exitCode } = await runCliForTest([
      'help',
      'versoin',
      '--json',
    ]);

    expect(exitCode).toBe(2);
    expect(parseSingleJsonLine(stdout).error).toMatchObject({
      code: 'USAGE',
      message: "Unknown command 'versoin'",
    });
  });

  it('prints human errors on stderr only', async () => {
    const { stdout, stderr, exitCode } = await runCliForTest(['versoin']);

    expect(exitCode).toBe(2);
    expect(stdout).toBe('');
    expect(stderr).toContain("Unknown command 'versoin'");
  });

  it('uses the last --format value', async () => {
    const jsonRun = await runCliForTest([
      'version',
      '--format',
      'human',
      '--format',
      'json',
    ]);
    const humanRun = await runCliForTest([
      'version',
      '--format=json',
      '--format=human',
    ]);

    expect(parseSingleJsonLine(jsonRun.stdout).ok).toBe(true);
    expect(humanRun.stdout).toMatch(/^twenty /);
  });

  it('rejects --json combined with --format', async () => {
    const { stdout, exitCode } = await runCliForTest([
      '--json',
      '--format',
      'ndjson',
      'version',
    ]);

    expect(exitCode).toBe(2);
    expect(parseSingleJsonLine(stdout).error.code).toBe('USAGE');
  });

  it('refuses NDJSON for commands that do not stream', async () => {
    const { stdout, exitCode } = await runCliForTest([
      'version',
      '--format',
      'ndjson',
    ]);

    expect(exitCode).toBe(2);
    expect(parseSingleJsonLine(stdout)).toMatchObject({
      command: 'version',
      type: 'error',
      sequence: 1,
      data: { code: 'USAGE' },
    });
  });

  it.each([
    { args: ['build'], unknownCommand: 'build', helpCommand: 'twenty' },
    { args: ['dev:build'], unknownCommand: 'dev:build', helpCommand: 'twenty' },
    {
      args: ['app:publish'],
      unknownCommand: 'app:publish',
      helpCommand: 'twenty',
    },
    {
      args: ['remote:add'],
      unknownCommand: 'remote:add',
      helpCommand: 'twenty',
    },
    {
      args: ['remote', 'add'],
      unknownCommand: 'add',
      helpCommand: 'twenty remote',
    },
  ])(
    'rejects $args with normal usage guidance',
    async ({ args, unknownCommand, helpCommand }) => {
      const { stdout, exitCode } = await runCliForTest([...args, '--json']);
      const { error } = parseSingleJsonLine(stdout);

      expect(exitCode).toBe(2);
      expect(error).toMatchObject({
        code: 'USAGE',
        message: expect.stringContaining(`Unknown command '${unknownCommand}'`),
        hint: `See: ${helpCommand} --help`,
      });
      expect(error.details).toBeUndefined();
    },
  );
});
