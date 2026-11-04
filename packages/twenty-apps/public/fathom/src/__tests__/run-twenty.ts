import { spawn } from 'child_process';
import { delimiter, join } from 'path';

type TwentyCliError = {
  code: string;
  message: string;
  hint?: string;
  details?: unknown;
};

export type TwentyCliResult =
  | { ok: true; data: unknown }
  | { ok: false; error: TwentyCliError };

function withoutProjectBinaries(pathValue: string) {
  return pathValue
    .split(delimiter)
    .filter(
      (entry) =>
        entry !== process.env.BERRY_BIN_FOLDER &&
        !entry.endsWith(join('node_modules', '.bin')),
    )
    .join(delimiter);
}

export function runTwenty(cliArguments: string[]): Promise<TwentyCliResult> {
  const executable = process.env.TWENTY_CLI ?? 'twenty';

  return new Promise((resolve, reject) => {
    const child = spawn(executable, [...cliArguments, '--json'], {
      env: {
        ...process.env,
        PATH: withoutProjectBinaries(process.env.PATH ?? ''),
      },
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    let stdout = '';

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
    });

    child.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        reject(error);

        return;
      }

      reject(
        new Error(
          `${executable} was not found. Install the Twenty CLI globally, or set TWENTY_CLI to its path.`,
        ),
      );
    });

    child.on('close', (exitCode) => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject(
          new Error(
            `${executable} ${cliArguments.join(' ')} exited with code ${exitCode} without a JSON result. ` +
              'Check that it is the Twenty CLI (twenty --version), or set TWENTY_CLI to its path.',
          ),
        );
      }
    });
  });
}
