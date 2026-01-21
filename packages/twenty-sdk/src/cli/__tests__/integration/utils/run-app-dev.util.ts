import { runCliCommand, type RunCliCommandResult } from './run-cli-command.util';

export type RunAppDevOptions = {
  appPath: string;
  timeout?: number;
};

export const runAppDev = (options: RunAppDevOptions): Promise<RunCliCommandResult> => {
  const { appPath, timeout = 30000 } = options;

  return runCliCommand({
    command: 'app:dev',
    args: [appPath],
    cwd: appPath,
    waitForOutput: 'Watching for changes',
    timeout,
  });
};
