import chalk from 'chalk';
import { execSync } from 'node:child_process';

const LOCAL_PORTS = [2020, 3000];

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

const detectRunningServer = async (
  preferredPort?: number,
): Promise<number | null> => {
  const ports = preferredPort ? [preferredPort] : LOCAL_PORTS;

  for (const port of ports) {
    if (await isServerReady(port)) {
      return port;
    }
  }

  return null;
};

export type LocalInstanceResult = {
  running: boolean;
  serverUrl?: string;
};

export const setupLocalInstance = async (
  appDirectory: string,
  preferredPort?: number,
): Promise<LocalInstanceResult> => {
  const detectedPort = await detectRunningServer(preferredPort);

  if (detectedPort) {
    const serverUrl = `http://localhost:${detectedPort}`;

    console.log(chalk.green(`Twenty server detected on ${serverUrl}.\n`));

    return { running: true, serverUrl };
  }

  if (preferredPort) {
    console.log(
      chalk.yellow(
        `No Twenty server found on port ${preferredPort}.\n` +
          'Start your server and run `yarn twenty remote add --local` manually.\n',
      ),
    );

    return { running: false };
  }

  console.log(chalk.blue('Setting up local Twenty instance...\n'));

  try {
    execSync('yarn twenty server start', {
      cwd: appDirectory,
      stdio: 'inherit',
    });
  } catch {
    return { running: false };
  }

  console.log(chalk.gray('Waiting for Twenty to be ready...\n'));

  const startTime = Date.now();
  const timeoutMs = 180 * 1000;

  while (Date.now() - startTime < timeoutMs) {
    if (await isServerReady(LOCAL_PORTS[0])) {
      const serverUrl = `http://localhost:${LOCAL_PORTS[0]}`;

      console.log(chalk.green(`Server running on '${serverUrl}'\n`));

      return { running: true, serverUrl };
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log(
    chalk.yellow(
      'Twenty server did not become healthy in time.\n',
      "Check: 'yarn twenty server logs'\n",
    ),
  );

  return { running: false };
};
