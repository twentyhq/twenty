import { parse } from 'yaml';

import { install } from '@/utils/install';

type ExecCallback = (error: Error | null, stdout?: string) => void;

jest.mock('child_process', () => ({ exec: jest.fn() }));

// node's `exec` is overloaded and its widest overload does not accept this
// callback shape, so take the mock from the module registry under the shape the
// promisified call actually uses, rather than casting the imported binding.
const { exec: mockExec } = jest.requireMock<{
  exec: jest.Mock<void, [string, unknown, ExecCallback]>;
}>('child_process');

type CommandOutcome = { stdout?: string; stderr?: string; fails?: boolean };

const mockCommands = (outcomes: Record<string, CommandOutcome>) => {
  mockExec.mockImplementation(
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

const quarantineOutput = ({
  descriptor,
  selector,
}: {
  descriptor: string;
  selector: string;
}) =>
  `➤ YN0016: │ ${descriptor}@npm:${selector}: All versions satisfying "${selector}" are quarantined`;

const APP_DIRECTORY = '/tmp/some-scaffolded-app';

// The remediation is YAML the reader pastes into .yarnrc.yml, so assert it parses
// rather than that it reads correctly: a scoped descriptor left unquoted looks
// right in a substring check and is a YAML error in the file.
const parseSuggestedYarnrc = (message: string) => {
  const lines = message.split('\n');
  const blockStart = lines.findIndex(
    (line) => line.trim() === 'npmPreapprovedPackages:',
  );

  if (blockStart === -1) {
    throw new Error(`No npmPreapprovedPackages block in message:\n${message}`);
  }

  const block: string[] = [];

  for (const line of lines.slice(blockStart)) {
    if (line.trim().length === 0) {
      break;
    }

    block.push(line.slice('  '.length));
  }

  const parsed: { npmPreapprovedPackages: string[] } = parse(block.join('\n'));

  return parsed;
};

const installAndCatch = () =>
  install(APP_DIRECTORY).then(
    () => '',
    (error: Error) => error.message,
  );

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

    expect(mockExec).toHaveBeenCalledWith(
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

  it('says how to recover, since the scaffolded project itself is intact', async () => {
    mockCommands({
      'yarn install': { fails: true, stdout: 'YN0001: Something exploded' },
    });

    const message = await installAndCatch();

    expect(message).toContain('YN0001: Something exploded');
    expect(message).toContain('run `yarn install` there');
  });

  it('names the packages the gate actually quarantined', async () => {
    mockCommands({
      'yarn install': {
        fails: true,
        stdout: quarantineOutput({
          descriptor: 'twenty-ui',
          selector: '2.41.0',
        }),
      },
    });

    const message = await installAndCatch();

    expect(message).toContain('minimum');
    expect(message).toContain(APP_DIRECTORY);
    expect(parseSuggestedYarnrc(message)).toEqual({
      npmPreapprovedPackages: ['twenty-ui@2.41.0'],
    });
    // Never advise lowering the gate itself.
    expect(message).not.toContain('npmMinimalAgeGate');
  });

  it('waives the third-party package Yarn named, not the first-party ones', async () => {
    mockCommands({
      'yarn install': {
        fails: true,
        stdout: quarantineOutput({
          descriptor: '@scope/some-tool',
          selector: '^1.2.3',
        }),
      },
    });

    const message = await installAndCatch();

    expect(parseSuggestedYarnrc(message)).toEqual({
      npmPreapprovedPackages: ['@scope/some-tool@^1.2.3'],
    });
    expect(message).not.toContain('twenty-ui');
    expect(message).not.toContain('twenty-sdk');
  });

  it('waives a quarantined dist-tag by name, since a tag is not a usable range', async () => {
    mockCommands({
      'yarn install': {
        fails: true,
        stdout:
          '➤ YN0016: │ twenty-ui@npm:latest: The version for tag "latest" is quarantined, and no lower version is available',
      },
    });

    const message = await installAndCatch();

    expect(parseSuggestedYarnrc(message)).toEqual({
      npmPreapprovedPackages: ['twenty-ui'],
    });
    expect(message).not.toContain('twenty-ui@latest');
  });

  it('falls back to the yarn output when no package can be identified', async () => {
    mockCommands({
      'yarn install': {
        fails: true,
        stdout: '➤ YN0016: │ something unparseable happened',
      },
    });

    const message = await installAndCatch();

    expect(message).toContain('something unparseable happened');
    expect(message).not.toContain('npmPreapprovedPackages');
  });

  it('tolerates corepack being unavailable when yarn still installs', async () => {
    mockCommands({ 'corepack enable': { fails: true, stderr: 'no corepack' } });

    await expect(install(APP_DIRECTORY)).resolves.toBeUndefined();
  });
});
