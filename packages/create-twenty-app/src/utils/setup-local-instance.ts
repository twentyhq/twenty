import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const DEFAULT_PORT = 2020;

// Minimal health check — the full implementation lives in twenty-sdk
const isServerReady = async (port: number): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`http://localhost:${port}/healthz`, {
      signal: controller.signal,
    });

    const body = await response.json();

    return body.status === 'ok';
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

export type LocalInstanceResult = {
  running: boolean;
  serverUrl?: string;
};

export const setupLocalInstance = async (
  appDirectory: string,
): Promise<LocalInstanceResult> => {
  console.log('');
  console.log(chalk.blue('Setting up local Twenty instance...'));

  if (await isServerReady(DEFAULT_PORT)) {
    const serverUrl = `http://localhost:${DEFAULT_PORT}`;

    console.log(chalk.green(`Twenty server detected on ${serverUrl}.`));

    return { running: true, serverUrl };
  }

  // Delegate to `twenty server start` from the scaffolded app
  console.log(chalk.gray('Starting local Twenty server...'));

  try {
    execSync('yarn twenty server start', {
      cwd: appDirectory,
      stdio: 'inherit',
    });
  } catch {
    console.log(
      chalk.yellow(
        'Failed to start Twenty server. Run `yarn twenty server start` manually.',
      ),
    );

    return { running: false };
  }

  console.log(chalk.gray('Waiting for Twenty to be ready...'));

  const startTime = Date.now();
  const timeoutMs = 180 * 1000;

  while (Date.now() - startTime < timeoutMs) {
    if (await isServerReady(DEFAULT_PORT)) {
      const serverUrl = `http://localhost:${DEFAULT_PORT}`;

      console.log(chalk.green(`Twenty server is running on ${serverUrl}.`));
      console.log(
        chalk.gray(
          'Workspace ready — login with tim@apple.dev / tim@apple.dev',
        ),
      );

      const openCommand = platform() === 'darwin' ? 'open' : 'xdg-open';

      try {
        execSync(`${openCommand} ${serverUrl}`, { stdio: 'ignore' });
      } catch {
        // Ignore if browser can't be opened
      }

      return { running: true, serverUrl };
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(
    chalk.yellow(
      'Twenty server did not become healthy in time. Check: yarn twenty server logs',
    ),
  );

  return { running: false };
};
