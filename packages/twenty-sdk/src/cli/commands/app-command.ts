import { formatPath } from '@/cli/utilities/file/file-path';
import chalk from 'chalk';
import type { Command } from 'commander';
import { AppBuildCommand } from './build';
import { AppDevCommand } from './dev';
import { AppPublishCommand } from './publish';
import { AppTypecheckCommand } from './typecheck';
import { AppUninstallCommand } from './uninstall';
import { DeployCommand } from './deploy';
import { LogicFunctionExecuteCommand } from './exec';
import { LogicFunctionLogsCommand } from './logs';
import { EntityAddCommand } from './add';
import { registerRemoteCommands } from './remote';
import { SyncableEntity } from 'twenty-shared/application';

export const registerCommands = (program: Command): void => {
  const buildCommand = new AppBuildCommand();
  const devCommand = new AppDevCommand();
  const publishCommand = new AppPublishCommand();
  const typecheckCommand = new AppTypecheckCommand();
  const uninstallCommand = new AppUninstallCommand();
  const deployCommand = new DeployCommand();
  const addCommand = new EntityAddCommand();
  const logsCommand = new LogicFunctionLogsCommand();
  const executeCommand = new LogicFunctionExecuteCommand();

  program
    .command('dev [appPath]')
    .description('Watch and sync local application changes')
    .action(async (appPath) => {
      await devCommand.execute({
        appPath: formatPath(appPath),
      });
    });

  program
    .command('build [appPath]')
    .description('Build, sync, and generate API client into .twenty/output/')
    .option('--tarball', 'Also pack into a .tgz tarball')
    .action(async (appPath, options) => {
      await buildCommand.execute({
        appPath: formatPath(appPath),
        tarball: options.tarball,
      });
    });

  program
    .command('deploy [appPath]')
    .description('Build and deploy to a Twenty server')
    .option('-r, --remote <name>', 'Deploy to a specific remote')
    .action(async (appPath, options) => {
      await deployCommand.execute({
        appPath: formatPath(appPath),
        remote: options.remote,
      });
    });

  program
    .command('publish [appPath]')
    .description('Build and publish to npm')
    .option('--tag <tag>', 'npm dist-tag (e.g. beta, next)')
    .action(async (appPath, options) => {
      await publishCommand.execute({
        appPath: formatPath(appPath),
        tag: options.tag,
      });
    });

  program
    .command('typecheck [appPath]')
    .description('Run TypeScript type checking on the application')
    .action(async (appPath) => {
      await typecheckCommand.execute({
        appPath: formatPath(appPath),
      });
    });

  program
    .command('uninstall [appPath]')
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

  registerRemoteCommands(program);

  program
    .command('add [entityType]')
    .option('--path <path>', 'Path in which the entity should be created.')
    .description(
      `Add a new entity to your application (${Object.values(SyncableEntity).join('|')})`,
    )
    .action(async (entityType?: string, options?: { path?: string }) => {
      await addCommand.execute(entityType as SyncableEntity, options?.path);
    });

  program
    .command('exec [appPath]')
    .option('--postInstall', 'Execute post-install logic function if defined')
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
          postInstall?: boolean;
          payload?: string;
          functionUniversalIdentifier?: string;
          functionName?: string;
        },
      ) => {
        if (
          !options?.postInstall &&
          !options?.functionUniversalIdentifier &&
          !options?.functionName
        ) {
          console.error(
            chalk.red(
              'Error: Either --postInstall or --functionName (-n) or --functionUniversalIdentifier (-u) is required.',
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

  program
    .command('logs [appPath]')
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
};
