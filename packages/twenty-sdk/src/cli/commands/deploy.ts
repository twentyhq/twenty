import path from 'path';

import { appBuild } from '@/cli/operations/build';
import { appDeploy } from '@/cli/operations/deploy';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { readJson } from '@/cli/utilities/file/fs-utils';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import chalk from 'chalk';

export type DeployCommandOptions = {
  appPath?: string;
  remote?: string;
};

export class DeployCommand {
  async execute(options: DeployCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    console.log(chalk.blue('Deploying application...'));
    console.log(chalk.gray(`App path: ${appPath}\n`));

    const onProgress = (message: string) => console.log(chalk.gray(message));

    const buildResult = await appBuild({
      appPath,
      tarball: true,
      onProgress,
    });

    if (!buildResult.success) {
      console.error(chalk.red(buildResult.error.message));
      process.exit(1);
    }

    const result = await appDeploy({
      tarballPath: buildResult.data.tarballPath!,
      remote: options.remote,
      onProgress,
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    const packageJson = await readJson<{ name?: string; version?: string }>(
      path.join(appPath, 'package.json'),
    ).catch(() => undefined);

    const appName = packageJson?.name ?? result.data.name;
    const appVersion = packageJson?.version ?? 'unknown';
    const remoteName = ConfigService.getActiveRemote();

    console.log(
      chalk.green(`\n✓ Published ${appName} v${appVersion} to ${remoteName}\n`),
    );
    console.log('  To install deployed application: `yarn twenty install`');
  }
}
