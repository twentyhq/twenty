import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { AppDevCommand } from './app/app-dev';
import { AppGenerateCommand } from './app/app-generate';
import { AppUninstallCommand } from './app/app-uninstall';
import { AuthListCommand } from './auth/auth-list';
import { AuthLoginCommand } from './auth/auth-login';
import { AuthLogoutCommand } from './auth/auth-logout';
import { AuthStatusCommand } from './auth/auth-status';
import { LogicFunctionExecuteCommand } from './logic-function/logic-function-execute';
import { LogicFunctionLogsCommand } from './logic-function/logic-function-logs';
import { AuthSwitchCommand } from './auth/auth-switch';
import { EntityAddCommand } from './entity/entity-add';
import { SyncableEntity } from 'twenty-shared/application';

export const registerCommands = (program: Command): void => {
  // Auth commands
  const listCommand = new AuthListCommand();
  const loginCommand = new AuthLoginCommand();
  const logoutCommand = new AuthLogoutCommand();
  const statusCommand = new AuthStatusCommand();
  const switchCommand = new AuthSwitchCommand();

  program
    .command('auth:login')
    .description('Authenticate with Twenty')
    .option('--api-key <key>', 'API key for authentication')
    .option('--api-url <url>', 'Twenty API URL')
    .action(async (options) => {
      await loginCommand.execute(options);
    });

  program
    .command('auth:logout')
    .description('Remove authentication credentials')
    .action(async () => {
      await logoutCommand.execute();
    });

  program
    .command('auth:status')
    .description('Check authentication status')
    .action(async () => {
      await statusCommand.execute();
    });

  program
    .command('auth:switch [workspace]')
    .description('Switch the default workspace for authentication')
    .action(async (workspace?: string) => {
      await switchCommand.execute({ workspace });
    });

  program
    .command('auth:list')
    .description('List all configured workspaces')
    .action(async () => {
      await listCommand.execute();
    });

  // App commands
  const devCommand = new AppDevCommand();
  const uninstallCommand = new AppUninstallCommand();
  const addCommand = new EntityAddCommand();
  const generateCommand = new AppGenerateCommand();
  const logsCommand = new LogicFunctionLogsCommand();
  const executeCommand = new LogicFunctionExecuteCommand();

  program
    .command('app:dev [appPath]')
    .description('Watch and sync local application changes')
    .action(async (appPath) => {
      await devCommand.execute({
        appPath: formatPath(appPath),
      });
    });

  program
    .command('app:uninstall [appPath]')
    .description('Uninstall application from Twenty')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (appPath?: string, options?: { yes?: boolean }) => {
      try {
        const result = await uninstallCommand.execute({
          appPath: formatPath(appPath),
          askForConfirmation: !options?.yes,
        });
        process.exit(result.success ? 0 : 1);
      } catch {
        process.exit(1);
      }
    });

  program
    .command('entity:add [entityType]')
    .option('--path <path>', 'Path in which the entity should be created.')
    .description(
      `Add a new entity to your application (${Object.values(SyncableEntity).join('|')})`,
    )
    .action(async (entityType?: string, options?: { path?: string }) => {
      await addCommand.execute(entityType as SyncableEntity, options?.path);
    });

  program
    .command('app:generate [appPath]')
    .description('Generate Twenty client')
    .action(async (appPath?: string) => {
      await generateCommand.execute(formatPath(appPath));
    });

  // Function commands
  program
    .command('function:logs [appPath]')
    .option(
      '-u, --functionUniversalIdentifier <functionUniversalIdentifier>',
      'Only show logs for the function with this universal ID',
    )
    .option(
      '-n, --functionName <functionName>',
      'Only show logs for the function with this name',
    )
    .description('Watch application function logs')
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
    .command('function:execute [appPath]')
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
    .description('Execute a logic function with a JSON payload')
    .action(
      async (
        appPath?: string,
        options?: {
          payload?: string;
          functionUniversalIdentifier?: string;
          functionName?: string;
        },
      ) => {
        if (!options?.functionUniversalIdentifier && !options?.functionName) {
          console.error(
            chalk.red(
              'Error: Either --functionName (-n) or --functionUniversalIdentifier (-u) is required.',
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
