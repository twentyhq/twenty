import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  parseSingleJsonLine,
  runCliForTest,
} from '@/__tests__/utils/run-cli-for-test';
import {
  checkLocalHealth,
  waitForLocalHealth,
} from '@/local/check-local-health';
import { getLocalEnvironment } from '@/local/get-local-environment';
import { runDocker } from '@/local/run-docker';
import { CliError } from '@/output/cli-error';

vi.mock('@/local/run-docker', () => ({ runDocker: vi.fn() }));
vi.mock('@/local/check-local-health', () => ({
  checkLocalHealth: vi.fn(),
  waitForLocalHealth: vi.fn(),
}));

const environment = getLocalEnvironment(true);
const makeContainer = (running = true) => ({
  Id: 'test-container',
  Image: 'old-image',
  Config: {
    Image: 'twentycrm/twenty-app-dev:v2.53.0',
    Env: [
      'APP_VERSION=2.53.0',
      'NODE_PORT=2021',
      'SERVER_URL=http://localhost:12021',
      'CUSTOM_SETTING=enabled',
    ],
  },
  State: { Running: running },
  HostConfig: {
    PortBindings: {
      ['2021/tcp' as string]: [{ HostIp: '127.0.0.1', HostPort: '12021' }],
    },
  },
  Mounts: Object.entries(environment.volumes).map(([Destination, Name]) => ({
    Type: 'volume',
    Destination,
    Name,
  })),
});
let container: ReturnType<typeof makeContainer> | undefined;
let failure: string | undefined;
let nextImageId: string;

const runJson = async (args: string[]) => {
  const result = await runCliForTest(['local', ...args, '--test', '--json']);
  return { ...result, envelope: parseSingleJsonLine(result.stdout) };
};
const dockerArguments = () =>
  vi.mocked(runDocker).mock.calls.map(([{ args }]) => args);
const mutations = () =>
  dockerArguments().filter(([command]) =>
    ['run', 'start', 'stop', 'pull', 'rm', 'volume'].includes(command),
  );

describe('local commands', () => {
  beforeEach(() => {
    container = makeContainer();
    failure = undefined;
    nextImageId = 'new-image';
    vi.stubEnv('DOCKER_HOST', '');
    vi.stubEnv('DOCKER_CONTEXT', '');
    vi.stubEnv('TWENTY_REMOTE', '');
    vi.stubEnv('TWENTY_API_URL', '');
    vi.stubEnv('TWENTY_API_KEY', '');
    vi.mocked(checkLocalHealth).mockResolvedValue(true);
    vi.mocked(waitForLocalHealth).mockResolvedValue(undefined);
    vi.mocked(runDocker).mockImplementation(async ({ args, onOutput }) => {
      if (args[0] === failure || args.slice(0, 2).join(' ') === failure)
        throw new CliError({
          code: 'LOCAL_ENVIRONMENT_FAILED',
          message: 'Docker failed',
        });
      if (args[0] === 'context') return 'unix:///var/run/docker.sock';
      if (args[0] === 'info') return '28.0';
      if (args[0] === 'container' && args[1] === 'ls')
        return container?.Id ?? '';
      if (args[0] === 'container') return JSON.stringify(container);
      if (args[0] === 'image')
        return args[3] === '{{.Id}}'
          ? nextImageId
          : JSON.stringify(['APP_VERSION=2.53.0', 'NODE_PORT=3000']);
      if (args[0] === 'start' && container) container.State.Running = true;
      if (args[0] === 'stop' && container) container.State.Running = false;
      if (args[0] === 'rm') container = undefined;
      if (args[0] === 'run') {
        container = makeContainer();
        container.Config.Image = args.at(-1)!;
        container.Image = nextImageId;
        const [, hostPort, internalPort] =
          args[args.indexOf('--publish') + 1].split(':');
        container.HostConfig.PortBindings = {
          [`${internalPort}/tcp`]: [
            { HostIp: '127.0.0.1', HostPort: hostPort },
          ],
        };
      }
      if (args[0] === 'volume' && args[1] === 'ls')
        return [
          ...Object.values(environment.volumes),
          'twenty-app-dev-data',
          'unrelated',
        ].join('\n');
      if (args[0] === 'logs')
        await onOutput?.('server started\nworker ready\n');
      return '';
    });
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetAllMocks();
  });

  it('creates an isolated instance without an app or saved connection', async () => {
    container = undefined;
    const { exitCode, envelope } = await runJson([
      'start',
      '2.54.0',
      '--port',
      '12021',
    ]);
    expect(exitCode).toBe(0);
    expect(envelope.data).toMatchObject({
      name: environment.name,
      status: 'healthy',
      url: 'http://localhost:12021',
    });
    const run = mutations().find(([command]) => command === 'run')!;
    expect(run).toContain('127.0.0.1:12021:12021');
    expect(run).toContain('twentycrm/twenty-app-dev:v2.54.0');
    expect(run).toContain('twenty-app-dev-test-data:/data/postgres');
    expect(run).not.toContain('twenty-app-dev-data:/data/postgres');
  });

  it('refreshes latest before creating an instance, instead of trusting a stale cached image', async () => {
    container = undefined;
    expect((await runJson(['start'])).exitCode).toBe(0);
    expect(mutations()[0]).toEqual(['pull', 'twentycrm/twenty-app-dev:latest']);
    expect(mutations()[1][0]).toBe('run');
  });

  it('restarts a stopped instance without replacing it or changing its port', async () => {
    container = makeContainer(false);
    const { exitCode, envelope } = await runJson(['start']);
    expect(exitCode).toBe(0);
    expect(envelope.data.url).toBe('http://localhost:12021');
    expect(mutations()).toEqual([['start', 'test-container']]);
  });

  it.each([['--port', '2021'], ['2.54.0']])(
    'refuses to replace existing settings during start: %j',
    async (...args) => {
      const { exitCode, envelope } = await runJson(['start', ...args]);
      expect(exitCode).toBe(1);
      expect(envelope.error.code).toBe('CONFLICT');
      expect(mutations()).toEqual([]);
    },
  );

  it('reports unavailable Docker as a failure, not a missing environment', async () => {
    failure = 'info';
    const { exitCode, envelope } = await runJson(['status']);
    expect(exitCode).toBe(1);
    expect(envelope.error.code).toBe('LOCAL_ENVIRONMENT_FAILED');
  });

  it('distinguishes absent, stopped and unhealthy environments', async () => {
    container = undefined;
    expect((await runJson(['status'])).envelope.data.status).toBe(
      'not-created',
    );
    container = makeContainer(false);
    expect((await runJson(['status'])).envelope.data.status).toBe('stopped');
    container.State.Running = true;
    vi.mocked(checkLocalHealth).mockResolvedValue(false);
    expect((await runJson(['status'])).envelope.data.status).toBe('starting');
    expect(mutations()).toEqual([]);
  });

  it('does not claim startup success when readiness fails', async () => {
    vi.mocked(waitForLocalHealth).mockRejectedValue(
      new CliError({ code: 'TIMEOUT', message: 'Not ready' }),
    );
    expect((await runJson(['start'])).envelope.error.code).toBe('TIMEOUT');
    expect(mutations()).toEqual([]);
  });

  it('stops without removing the container or its data', async () => {
    expect((await runJson(['stop'])).exitCode).toBe(0);
    expect(mutations()).toEqual([['stop', 'test-container']]);
  });

  it('requires explicit approval before reset in JSON mode', async () => {
    const { exitCode, envelope } = await runJson(['reset']);
    expect(exitCode).toBe(2);
    expect(envelope.error.code).toBe('CONFIRMATION_REQUIRED');
    expect(runDocker).not.toHaveBeenCalled();
  });

  it('resets only the selected instance and its known volumes', async () => {
    expect((await runJson(['reset', '--yes'])).exitCode).toBe(0);
    expect(mutations()).toEqual([
      ['rm', '--force', 'test-container'],
      ['volume', 'ls', '--format', '{{.Name}}'],
      ['volume', 'rm', ...Object.values(environment.volumes)],
    ]);
  });

  it.each(['reset', 'upgrade'])(
    'refuses custom storage before %s changes anything',
    async (command) => {
      container!.Mounts[0].Type = 'bind';
      const { envelope } = await runJson([
        command,
        ...(command === 'reset' ? ['--yes'] : ['2.54.0']),
      ]);
      expect(envelope.error.code).toBe('CONFLICT');
      expect(mutations()).toEqual([]);
    },
  );

  it('refuses to reset a same-name container owned by another image', async () => {
    container!.Config.Image = 'another/service:latest';
    expect((await runJson(['reset', '--yes'])).envelope.error.code).toBe(
      'CONFLICT',
    );
    expect(mutations()).toEqual([]);
  });

  it('refuses a remote Docker endpoint even for an approved reset', async () => {
    vi.stubEnv('DOCKER_HOST', 'ssh://production');
    expect((await runJson(['reset', '--yes'])).envelope.error.code).toBe(
      'INVALID_CONFIG',
    );
    expect(runDocker).not.toHaveBeenCalled();
  });

  it('leaves the running instance untouched if the upgrade image cannot be pulled', async () => {
    failure = 'pull';
    expect((await runJson(['upgrade', '2.54.0'])).exitCode).toBe(1);
    expect(mutations()).toEqual([['pull', 'twentycrm/twenty-app-dev:v2.54.0']]);
    expect(container?.State.Running).toBe(true);
  });

  it('does not recreate an instance already on the requested image digest', async () => {
    nextImageId = 'old-image';
    expect((await runJson(['upgrade', '2.54.0'])).envelope.data.upgraded).toBe(
      false,
    );
    expect(mutations()).toEqual([['pull', 'twentycrm/twenty-app-dev:v2.54.0']]);
  });

  it('upgrades gracefully, preserving volumes, port mapping and user overrides without stale image defaults', async () => {
    const { exitCode, envelope } = await runJson(['upgrade', '2.54.0']);
    expect(exitCode).toBe(0);
    expect(envelope.data).toMatchObject({
      upgraded: true,
      dataPreserved: true,
      url: 'http://localhost:12021',
    });
    expect(mutations().slice(0, 3)).toEqual([
      ['pull', 'twentycrm/twenty-app-dev:v2.54.0'],
      ['stop', '--time', '30', 'test-container'],
      ['rm', 'test-container'],
    ]);
    const run = mutations()[3];
    expect(run).toContain('127.0.0.1:12021:2021');
    expect(run).toContain('twenty-app-dev-test-data:/data/postgres');
    expect(run).toContain('CUSTOM_SETTING=enabled');
    expect(run).not.toContain('APP_VERSION=2.53.0');
    expect(run).not.toContain('APP_VERSION=2.54.0');
  });

  it('preserves older SDK volumes while adding storage for the current image', async () => {
    container!.Mounts = container!.Mounts.filter(
      (mount) => mount.Destination !== '/data/clickhouse',
    );
    expect((await runJson(['upgrade', '2.54.0'])).exitCode).toBe(0);
    const run = mutations().find(([command]) => command === 'run')!;
    expect(run).toContain('twenty-app-dev-test-data:/data/postgres');
    expect(run).toContain(
      'twenty-app-dev-test-storage:/app/packages/twenty-server/.local-storage',
    );
    expect(run).toContain('twenty-app-dev-test-clickhouse:/data/clickhouse');
  });

  it('does not report reset success when Docker cannot delete a volume', async () => {
    failure = 'volume rm';
    expect((await runJson(['reset', '--yes'])).exitCode).toBe(1);
  });

  it('streams logs as NDJSON and emits a terminal result', async () => {
    const { exitCode, stdout } = await runCliForTest([
      'local',
      'logs',
      '--test',
      '--no-follow',
      '--format',
      'ndjson',
    ]);
    expect(exitCode).toBe(0);
    const events = stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    expect(events.map(({ type }) => type)).toEqual([
      'start',
      'record',
      'result',
    ]);
    expect(events[1].data.message).toBe('server started\nworker ready\n');
    expect(dockerArguments().at(-1)).toEqual([
      'logs',
      '--tail',
      '50',
      'test-container',
    ]);
  });
});
