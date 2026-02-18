import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// CLI path and working directory (twenty-sdk src directory)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_DIR = path.resolve(__dirname, '../../../..');
const CLI_PATH = path.resolve(CLI_DIR, 'cli/cli.ts');

export type RunCliCommandOptions = {
  command: string;
  args?: string[];
  waitForOutput?: string | string[];
  timeout?: number;
};

export type RunCliCommandResult = {
  success: boolean;
  output: string;
};

export const runCliCommand = (
  options: RunCliCommandOptions,
): Promise<RunCliCommandResult> => {
  const { command, args = [], waitForOutput, timeout = 30_000 } = options;

  return new Promise((resolve) => {
    // Run from CLI directory to use twenty-sdk's tsconfig paths
    const child: ChildProcess = spawn(
      'npx',
      ['tsx', CLI_PATH, command, ...args],
      {
        cwd: CLI_DIR,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          FORCE_COLOR: '0',
        },
      },
    );

    let output = '';
    const timeoutId = setTimeout(() => {
      child.kill();
      console.log(`RunCliCommand ${command} timeout after ${timeout / 1_000}s`);
      resolve({ success: false, output });
    }, timeout);

    const waitForOutputs = Array.isArray(waitForOutput)
      ? waitForOutput
      : waitForOutput
        ? [waitForOutput]
        : [];

    let isResolved = false;
    child.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
      if (
        !isResolved &&
        waitForOutputs.length > 0 &&
        waitForOutputs.every((w) => output.includes(w))
      ) {
        isResolved = true;
        clearTimeout(timeoutId);
        // Wait a bit before killing to allow any in-progress file writes to complete
        setTimeout(() => {
          child.kill();
          resolve({ success: true, output });
        }, 1500);
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      resolve({ success: code === 0, output });
    });

    child.on('error', () => {
      clearTimeout(timeoutId);
      resolve({ success: false, output });
    });
  });
};
