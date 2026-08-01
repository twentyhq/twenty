import { join, resolve } from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import { ClientService } from '@/cli/utilities/client/client-service';
import { resolveClientSdkPackageRoot } from '@/cli/utilities/client/resolve-client-sdk-package-root';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { isNonEmptyString } from '@sniptt/guards';
import chalk from 'chalk';
import { isDefined } from 'twenty-shared/utils';

export type AppGenerateClientCommandOptions = {
  appPath?: string;
  output?: string;
  typesOnly?: boolean;
};

export class AppGenerateClientCommand {
  async execute(options: AppGenerateClientCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;
    const outputPath = isNonEmptyString(options.output)
      ? resolve(appPath, options.output)
      : undefined;

    if (options.typesOnly && !isDefined(outputPath)) {
      console.error(chalk.red('--types-only requires --output.'));
      process.exit(1);
    }

    let reportedOutputPath = outputPath;

    if (!isDefined(outputPath)) {
      const clientSdkPackageRoot = await resolveClientSdkPackageRoot(appPath);

      if (!isDefined(clientSdkPackageRoot)) {
        console.error(
          chalk.red(
            `Cannot find twenty-client-sdk in ${appPath} or any parent directory.\n\n` +
              '  Install it first:\n' +
              '    yarn add twenty-client-sdk',
          ),
        );
        process.exit(1);
      }

      reportedOutputPath = join(
        clientSdkPackageRoot,
        'dist',
        'core',
        'generated',
      );
    }

    const apiService = new ApiService({ disableInterceptors: true });
    const validateAuth = await apiService.validateAuth();

    if (!validateAuth.serverUp) {
      console.error(
        chalk.red(
          'Cannot reach Twenty server.\n\n' +
            '  Check your remotes:\n' +
            '    yarn twenty remote:status',
        ),
      );
      process.exit(1);
    }

    if (!validateAuth.authValid) {
      console.error(
        chalk.red(
          'Authentication failed. Run `yarn twenty remote:add` to authenticate.',
        ),
      );
      process.exit(1);
    }

    console.log(
      chalk.blue(
        options.typesOnly
          ? 'Generating API types...'
          : 'Generating API client...',
      ),
    );

    try {
      const clientService = new ClientService({ skipAuth: false });

      if (isDefined(outputPath)) {
        const remoteConfig = await new ConfigService().getConfig();

        await clientService.generateCoreClientToPath({
          outputPath,
          typesOnly: options.typesOnly ?? false,
          remoteUrl: remoteConfig.apiUrl,
        });
      } else {
        await clientService.generateCoreClient({ appPath });
      }
    } catch (error) {
      console.error(
        chalk.red(`Failed to generate API client: ${serializeError(error)}`),
      );
      process.exit(1);
    }

    console.log(
      chalk.green(
        options.typesOnly ? '✓ API types generated' : '✓ API client generated',
      ),
    );
    console.log(chalk.gray(`Output: ${reportedOutputPath}`));
  }
}
