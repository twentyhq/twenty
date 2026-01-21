import { spawn, type ChildProcess } from 'child_process';
import { join } from 'path';

const CLI_PATH = join(__dirname, '../../../cli.ts');

export type RunCliCommandOptions = {
  command: string;
  args?: string[];
  cwd: string;
  waitForOutput?: string;
  timeout?: number;
};

export type RunCliCommandResult = {
  success: boolean;
  output: string;
};

export const runCliCommand = (
  options: RunCliCommandOptions,
): Promise<RunCliCommandResult> => {
  const {
    command,
    args = [],
    cwd,
    waitForOutput,
    timeout = 30000,
  } = options;

  return new Promise((resolve) => {
    const child: ChildProcess = spawn(
      'npx',
      ['tsx', CLI_PATH, command, ...args],
      {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, FORCE_COLOR: '0' },
      },
    );

    let output = '';
    const timeoutId = setTimeout(() => {
      child.kill();
      resolve({ success: false, output });
    }, timeout);

    child.stdout?.on('data', (data: Buffer) => {
      output += data.toString();
      if (waitForOutput && output.includes(waitForOutput)) {
        clearTimeout(timeoutId);
        child.kill();
        resolve({ success: true, output });
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (!waitForOutput) {
        resolve({ success: code === 0, output });
      } else {
        resolve({ success: false, output });
      }
    });

    child.on('error', () => {
      clearTimeout(timeoutId);
      resolve({ success: false, output });
    });
  });
};
