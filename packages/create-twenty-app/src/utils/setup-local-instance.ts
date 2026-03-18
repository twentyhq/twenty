import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { platform } from 'node:os';

const TWENTY_PORTS = [2020, 3000];

const checkHealthz = async (port: number): Promise<boolean> => {
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

const detectRunningServer = async (): Promise<number | null> => {
  for (const port of TWENTY_PORTS) {
    if (await checkHealthz(port)) {
      return port;
    }
  }

  return null;
};

const waitForHealthy = async ({
  port,
  timeoutSeconds = 120,
}: {
  port: number;
  timeoutSeconds?: number;
}): Promise<boolean> => {
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;

  while (Date.now() - startTime < timeoutMs) {
    if (await checkHealthz(port)) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return false;
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

  // Detect an already-running Twenty server on known ports
  const existingPort = await detectRunningServer();

  if (existingPort) {
    const serverUrl = `http://localhost:${existingPort}`;

    console.log(chalk.green(`Twenty server detected on ${serverUrl}.`));

    return { running: true, serverUrl };
  }

  // No server found — delegate to `twenty server start` from the scaffolded app
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

  const healthy = await waitForHealthy({ port: 2020, timeoutSeconds: 180 });

  if (!healthy) {
    console.log(
      chalk.yellow(
        'Twenty server did not become healthy in time. Check: yarn twenty server logs',
      ),
    );

    return { running: false };
  }

  const serverUrl = 'http://localhost:2020';

  console.log(chalk.green(`Twenty server is running on ${serverUrl}.`));
  console.log(
    chalk.gray('Workspace ready — login with tim@apple.dev / tim@apple.dev'),
  );

  const openCommand = platform() === 'darwin' ? 'open' : 'xdg-open';

  try {
    execSync(`${openCommand} ${serverUrl}`, { stdio: 'ignore' });
  } catch {
    // Ignore if browser can't be opened
  }

  return { running: true, serverUrl };
};
