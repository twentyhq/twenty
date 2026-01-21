import { runCliCommand, type RunCliCommandResult } from './run-cli-command.util';

export type RunAppDevOptions = {
  appPath: string;
  timeout?: number;
};

export const runAppDev = (options: RunAppDevOptions): Promise<RunCliCommandResult> => {
  const { appPath, timeout = 30000 } = options;

  // Wait for both functions and front components to build
  // They print their completion messages before printing "Watching for changes"
  return runCliCommand({
    command: 'app:dev',
    args: [appPath],
    waitForOutput: '✓ Functions built',
    timeout,
  });
};
