import { Logger } from '@nestjs/common';

import { RunInstanceCommandsCommand } from 'src/database/commands/run-instance-commands.command';

const FAST_STEP = '2.24.0_AddColumn_1784897347051';
const SLOW_DONE = '2.23.0_AlreadyBackfilled_1784322591746';
const SLOW_PENDING_A = '2.13.0_BackfillSomething_1781277480000';
const SLOW_PENDING_B = '2.18.0_BackfillSomethingElse_1810000003000';

const SEQUENCE = [
  { kind: 'fast-instance', name: FAST_STEP, command: {} },
  { kind: 'slow-instance', name: SLOW_PENDING_A, command: {} },
  { kind: 'slow-instance', name: SLOW_DONE, command: {} },
  { kind: 'slow-instance', name: SLOW_PENDING_B, command: {} },
  {
    kind: 'workspace',
    name: '2.24.0_SomeWorkspaceThing_1784897347052',
    command: {},
  },
];

const COMPLETED_SLOW_COMMANDS = new Set([SLOW_DONE]);

const buildCommand = () => {
  const runSlowInstanceCommand = jest
    .fn()
    .mockResolvedValue({ status: 'completed' });

  const command = new RunInstanceCommandsCommand(
    { query: jest.fn().mockResolvedValue([]) } as never,
    {
      getProvisionedWorkspaceIds: jest.fn().mockResolvedValue(['ws-1']),
    } as never,
    {
      getLastWorkspaceCommandForVersion: jest.fn().mockReturnValue(null),
    } as never,
    { getUpgradeSequence: jest.fn().mockReturnValue(SEQUENCE) } as never,
    {
      runFastInstanceCommand: jest
        .fn()
        .mockResolvedValue({ status: 'completed' }),
      runSlowInstanceCommand,
    } as never,
    {
      isLastAttemptCompleted: jest.fn(async ({ name }: { name: string }) =>
        COMPLETED_SLOW_COMMANDS.has(name),
      ),
    } as never,
    { invalidateInstanceAndAllWorkspacesStatus: jest.fn() } as never,
  );

  jest
    .spyOn(
      command as unknown as { runLegacyPendingTypeOrmMigrations: () => void },
      'runLegacyPendingTypeOrmMigrations',
    )
    .mockResolvedValue(undefined as never);

  return { command, runSlowInstanceCommand };
};

describe('RunInstanceCommandsCommand', () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const warnings = () => warn.mock.calls.map((call) => String(call[0]));

  it('names every pending slow command when they are skipped', async () => {
    const { command, runSlowInstanceCommand } = buildCommand();

    await command.run([], {});

    const text = warnings().join('\n');

    expect(text).toContain('2 slow instance command(s) pending');
    expect(text).toContain(SLOW_PENDING_A);
    expect(text).toContain(SLOW_PENDING_B);
    expect(runSlowInstanceCommand).not.toHaveBeenCalled();
  });

  it('does not name a slow command that has already completed', async () => {
    const { command } = buildCommand();

    await command.run([], {});

    expect(warnings().join('\n')).not.toContain(SLOW_DONE);
  });

  it('says nothing about pending work when slow commands are included', async () => {
    const { command, runSlowInstanceCommand } = buildCommand();

    await command.run([], { includeSlow: true });

    expect(warnings().join('\n')).not.toContain('pending');
    expect(runSlowInstanceCommand).toHaveBeenCalledTimes(3);
  });

  // deploy/production-converge.sh aborts a deploy when the post-merge output
  // matches these, so the warning must never trip them.
  it('does not emit text that production-converge.sh treats as a deploy failure', async () => {
    const { command } = buildCommand();

    await command.run([], {});

    const text = warnings().join('\n');

    expect(text).not.toContain('FAILED');
    expect(text).not.toContain('reported an error');
  });
});
