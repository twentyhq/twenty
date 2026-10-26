import { spawn } from 'node:child_process';

import { type LogicFunctionExecutionContext } from 'twenty-shared/logic-function';

import { LocalChildProcessRunnerService } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/services/local-child-process-runner.service';

jest.mock('node:child_process', () => ({
  spawn: jest.fn(() => ({
    stdout: { on: jest.fn() },
    stderr: { on: jest.fn() },
    on: jest.fn(),
    send: jest.fn(),
    kill: jest.fn(),
  })),
}));

describe('LocalChildProcessRunnerService', () => {
  const runner = new LocalChildProcessRunnerService();
  const originalEnv = process.env.LOGIC_FUNCTION_LOCAL_MAX_OLD_SPACE_SIZE_MB;

  afterEach(() => {
    jest.clearAllMocks();
    if (originalEnv !== undefined) {
      process.env.LOGIC_FUNCTION_LOCAL_MAX_OLD_SPACE_SIZE_MB = originalEnv;
    } else {
      delete process.env.LOGIC_FUNCTION_LOCAL_MAX_OLD_SPACE_SIZE_MB;
    }
  });

  it('spawns child process without max-old-space-size when env is not set', () => {
    delete process.env.LOGIC_FUNCTION_LOCAL_MAX_OLD_SPACE_SIZE_MB;
    runner.runChildWithEnv({
      runnerPath: '/path/to/runner.js',
      env: {},
      payload: {},
      context: {} as LogicFunctionExecutionContext,
      timeoutMs: 5000,
    });

    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      ['/path/to/runner.js'],
      expect.anything(),
    );
  });

  it('passes --max-old-space-size when valid positive integer is provided in env', () => {
    process.env.LOGIC_FUNCTION_LOCAL_MAX_OLD_SPACE_SIZE_MB = '256';
    runner.runChildWithEnv({
      runnerPath: '/path/to/runner.js',
      env: {},
      payload: {},
      context: {} as LogicFunctionExecutionContext,
      timeoutMs: 5000,
    });

    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      ['--max-old-space-size=256', '/path/to/runner.js'],
      expect.anything(),
    );
  });

  it('ignores invalid or non-positive max-old-space-size', () => {
    process.env.LOGIC_FUNCTION_LOCAL_MAX_OLD_SPACE_SIZE_MB = 'invalid';
    runner.runChildWithEnv({
      runnerPath: '/path/to/runner.js',
      env: {},
      payload: {},
      context: {} as LogicFunctionExecutionContext,
      timeoutMs: 5000,
    });

    expect(spawn).toHaveBeenCalledWith(
      process.execPath,
      ['/path/to/runner.js'],
      expect.anything(),
    );
  });
});
