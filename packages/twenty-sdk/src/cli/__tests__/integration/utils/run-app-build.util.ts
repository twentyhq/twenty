import { runCliCommand, type RunCliCommandResult } from './run-cli-command.util';

export type RunAppBuildOptions = {
  appPath: string;
  timeout?: number;
};

export const runAppBuild = (options: RunAppBuildOptions): Promise<RunCliCommandResult> => {
  const { appPath, timeout = 30000 } = options;

  // app:build runs once and exits, so we don't wait for specific output
  return runCliCommand({
    command: 'app:build',
    args: [appPath],
    timeout,
  });
};
