import { formatPath } from '@/cli/utilities/file/file-path';
import type { Command } from 'commander';
import { DeployCommand } from './deploy';
import { AppInstallCommand } from './install';
import { AppUninstallCommand } from './uninstall';

export const registerAppCommands = (program: Command): void => {
  const deployCommand = new DeployCommand();
  const installCommand = new AppInstallCommand();
  const uninstallCommand = new AppUninstallCommand();

  program
    .command('app:publish [appPath]')
    .description('Build and publish to npm (default) or server registry')
    .option('--private', "Push to a Twenty server's registry instead of npm")
    .option(
      '-r, --remote <name>',
      'Publish to a specific remote (with --private)',
    )
    .option('--tag <tag>', 'npm dist-tag (e.g. beta, next)')
    .option(
      '--version <version>',
      'Override the deployed version (with --private). Pass a semver version or "auto" to generate one, avoiding manual version bumps in CI/CD',
    )
    .action(async (appPath, options) => {
      await deployCommand.execute({
        appPath: formatPath(appPath),
        private: options.private,
        remote: options.remote,
        tag: options.tag,
        version: options.version,
      });
    });

  program
    .command('app:install [appPath]')
    .description('Install a deployed app on the server')
    .option('-r, --remote <name>', 'Install on a specific remote')
    .action(async (appPath, options) => {
      await installCommand.execute({
        appPath: formatPath(appPath),
        remote: options.remote,
      });
    });

  program
    .command('app:uninstall [appPath]')
    .description('Uninstall app from server')
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
};
