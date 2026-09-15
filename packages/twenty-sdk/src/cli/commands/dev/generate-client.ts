import { join } from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import { ClientService } from '@/cli/utilities/client/client-service';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';
import { serializeError } from '@/cli/utilities/error/serialize-error';
import { pathExists } from '@/cli/utilities/file/fs-utils';
import chalk from 'chalk';

export type AppGenerateClientCommandOptions = {
  appPath?: string;
};

export class AppGenerateClientCommand {
  async execute(options: AppGenerateClientCommandOptions): Promise<void> {
    const appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;
    const clientSdkPath = join(appPath, 'node_modules', 'twenty-client-sdk');

    if (!(await pathExists(clientSdkPath))) {
      console.error(
        chalk.red(
          `Cannot find twenty-client-sdk in ${appPath}.\n\n` +
            '  Install it first:\n' +
            '    yarn add twenty-client-sdk',
        ),
      );
      process.exit(1);
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

    console.log(chalk.blue('Generating API client...'));

    try {
      const clientService = new ClientService({ skipAuth: false });

      await clientService.generateCoreClient({ appPath });
    } catch (error) {
      console.error(
        chalk.red(`Failed to generate API client: ${serializeError(error)}`),
      );
      process.exit(1);
    }

    console.log(chalk.green('✓ API client generated'));
    console.log(
      chalk.gray(`Output: ${join(clientSdkPath, 'dist', 'core', 'generated')}`),
    );
  }
}
