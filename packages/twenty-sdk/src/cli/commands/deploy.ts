import { appDeploy } from '@/cli/operations/deploy';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { checkSdkVersionCompatibility } from '@/cli/utilities/version/check-sdk-version-compatibility';
import { ConfigService } from '@/cli/utilities/config/config-service';
import chalk from 'chalk';

export type DeployCommandOptions = {
  appPath?: string;
  remote?: string;
};

export class DeployCommand {
  async execute(options: DeployCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    await checkSdkVersionCompatibility(appPath);

    const configService = new ConfigService();
    let serverUrl: string;
    let token: string | undefined;

    if (options.remote) {
      const remoteConfig = await configService.getConfigForRemote(
        options.remote,
      );

      serverUrl = remoteConfig.apiUrl;
      token = remoteConfig.accessToken ?? remoteConfig.apiKey;
    } else {
      const config = await configService.getConfig();

      serverUrl = config.apiUrl;
      token = config.accessToken ?? config.apiKey;
    }

    const remoteName = options.remote ?? ConfigService.getActiveRemote();

    console.log(chalk.blue(`Deploying to ${remoteName} (${serverUrl})...`));
    console.log(chalk.gray(`App path: ${appPath}`));
    console.log('');

    const result = await appDeploy({
      appPath,
      serverUrl,
      token,
      onProgress: (message) => console.log(chalk.gray(message)),
    });

    if (!result.success) {
      console.error(chalk.red(result.error.message));
      process.exit(1);
    }

    console.log(chalk.green('✓ Deployed successfully'));
  }
}
