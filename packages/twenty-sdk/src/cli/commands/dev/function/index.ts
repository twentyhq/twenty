import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { LogicFunctionExecuteCommand } from '../exec';
import { LogicFunctionLogsCommand } from '../logs';

export const registerDevFunctionCommands = (program: Command): void => {
  const logsCommand = new LogicFunctionLogsCommand();
  const executeCommand = new LogicFunctionExecuteCommand();

  program
    .command('dev:function:logs [appPath]')
    .description('Stream logic function logs')
    .option(
      '-u, --functionUniversalIdentifier <functionUniversalIdentifier>',
      'Only show logs for the function with this universal ID',
    )
    .option(
      '-n, --functionName <functionName>',
      'Only show logs for the function with this name',
    )
    .action(
      async (
        appPath?: string,
        options?: {
          functionUniversalIdentifier?: string;
          functionName?: string;
        },
      ) => {
        await logsCommand.execute({
          ...options,
          appPath: formatPath(appPath),
        });
      },
    );

  program
    .command('dev:function:exec [appPath]')
    .description('Execute a logic function')
    .option('--postInstall', 'Execute post-install logic function if defined')
    .option('--preInstall', 'Execute pre-install logic function if defined')
    .option(
      '-p, --payload <payload>',
      'JSON payload to send to the function',
      '{}',
    )
    .option(
      '-u, --functionUniversalIdentifier <functionUniversalIdentifier>',
      'Universal ID of the function to execute',
    )
    .option(
      '-n, --functionName <functionName>',
      'Name of the function to execute',
    )
    .action(
      async (
        appPath?: string,
        options?: {
          postInstall?: boolean;
          preInstall?: boolean;
          payload?: string;
          functionUniversalIdentifier?: string;
          functionName?: string;
        },
      ) => {
        if (
          !options?.postInstall &&
          !options?.preInstall &&
          !options?.functionUniversalIdentifier &&
          !options?.functionName
        ) {
          console.error(
            chalk.red(
              'Error: Either --postInstall, --preInstall, --functionName (-n), or --functionUniversalIdentifier (-u) is required.',
            ),
          );
          process.exit(1);
        }
        await executeCommand.execute({
          ...options,
          payload: options?.payload ?? '{}',
          appPath: formatPath(appPath),
        });
      },
    );
};
