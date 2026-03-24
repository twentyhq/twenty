import {
  checkServerHealth,
  detectLocalServer,
} from '@/cli/utilities/server/detect-local-server';
import chalk from 'chalk';
import { execSync } from 'node:child_process';

const LOCAL_PORTS = [2020, 3000];

export type LocalInstanceResult = {
  running: boolean;
  serverUrl?: string;
};

export const setupLocalInstance = async (
  appDirectory: string,
  preferredPort?: number,
): Promise<LocalInstanceResult> => {
  const serverUrl = await detectLocalServer(preferredPort);

  if (serverUrl) {
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
    if (await checkServerHealth(LOCAL_PORTS[0])) {
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
