import { vi } from 'vitest';

import { runCli } from '@/run-cli';

export const runCliForTest = async (args: string[]) => {
  let stdout = '';
  let stderr = '';
  const stdoutSpy = vi
    .spyOn(process.stdout, 'write')
    .mockImplementation((chunk) => {
      stdout += String(chunk);

      return true;
    });
  const stderrSpy = vi
    .spyOn(process.stderr, 'write')
    .mockImplementation((chunk) => {
      stderr += String(chunk);

      return true;
    });
  const previousExitCode = process.exitCode;

  process.exitCode = undefined;

  try {
    await runCli(args);

    return { stdout, stderr, exitCode: Number(process.exitCode ?? 0) };
  } finally {
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    process.exitCode = previousExitCode;
  }
};

export const parseSingleJsonLine = (stdout: string) => {
  const lines = stdout.trimEnd().split('\n');

  if (lines.length !== 1) {
    throw new Error(`Expected one JSON line, got ${lines.length}: ${stdout}`);
  }

  return JSON.parse(lines[0]);
};
