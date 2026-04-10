import { authLogin } from '@/cli/operations/login';
import { authLoginOAuth } from '@/cli/operations/login-oauth';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { getConfigPath } from '@/cli/utilities/config/get-config-path';
import { detectLocalServer } from '@/cli/utilities/server/detect-local-server';
import chalk from 'chalk';
import type { Command } from 'commander';
import inquirer from 'inquirer';

const deriveRemoteName = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;

    return hostname.replace(/\./g, '-');
  } catch {
    return 'remote';
  }
};

const authenticate = async (apiUrl: string, apiKey?: string): Promise<void> => {
  const result = apiKey
    ? await authLogin({ apiKey, apiUrl })
    : await runOAuthWithApiKeyFallback(apiUrl);

  if (!result.success) {
    console.error(chalk.red('✗ Authentication failed.'));
    process.exit(1);
  }
};

const runOAuthWithApiKeyFallback = async (
  apiUrl: string,
): Promise<{ success: boolean }> => {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'confirm',
      message: 'Press Enter to open the browser for authentication...',
    },
  ]);

  const oauthResult = await authLoginOAuth({ apiUrl });

  if (oauthResult.success) {
    return oauthResult;
  }

  console.log(chalk.yellow(oauthResult.error.message));

  const keyAnswer = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'API Key:',
      mask: '*',
      validate: (input: string) => input.length > 0 || 'API key is required',
    },
  ]);

  return authLogin({ apiKey: keyAnswer.apiKey, apiUrl });
};

export const registerRemoteCommands = (program: Command): void => {
  const remote = program
    .command('remote')
    .description('Manage remote Twenty servers');

  remote
    .command('add')
    .description('Add a new remote or re-authenticate an existing one')
    .option('--as <name>', 'Name for this remote')
    .option('--api-key <apiKey>', 'API key for non-interactive auth')
    .option('--api-url <apiUrl>', 'Server URL')
    .option('--local', 'Connect to a local Twenty server (auto-detect)')
    .option('--test', 'Write to config.test.json (for integration tests)')
    .action(
      async (options: {
        as?: string;
        apiKey?: string;
        apiUrl?: string;
        local?: boolean;
        test?: boolean;
      }) => {
        const configPath = options.test ? getConfigPath(true) : undefined;
        const configService = new ConfigService(
          configPath ? { configPath } : undefined,
        );
        const existingRemotes = await configService.getRemotes();

        if (options.as !== undefined && existingRemotes.includes(options.as)) {
          const config = await configService.getConfigForRemote(options.as);

          ConfigService.setActiveRemote(options.as);
          await authenticate(config.apiUrl, options.apiKey);

          return;
        }

        let apiUrl = options.apiUrl;

        if (!apiUrl) {
          const detectedUrl = await detectLocalServer();

          if (options.local) {
            if (!detectedUrl) {
              console.error(
                chalk.red(
                  'No local Twenty server found.\n' +
                    'Start one with: yarn twenty server start',
                ),
              );
              process.exit(1);
            }

            console.log(chalk.gray(`Found local server at ${detectedUrl}`));
            apiUrl = detectedUrl;
          } else {
            apiUrl = (
              await inquirer.prompt<{ apiUrl: string }>([
                {
                  type: 'input',
                  name: 'apiUrl',
                  message: 'Twenty server URL:',
                  validate: (input: string) => {
                    try {
                      new URL(input);

                      return true;
                    } catch {
                      return 'Please enter a valid URL';
                    }
                  },
                },
              ])
            ).apiUrl;
          }
        }

        const name = options.as ?? deriveRemoteName(apiUrl);

        ConfigService.setActiveRemote(name);
        await authenticate(apiUrl, options.apiKey);

        const defaultRemote = await configService.getDefaultRemote();

        if (defaultRemote === 'local') {
          await configService.setDefaultRemote(name);
        }
      },
    );

  remote
    .command('list')
    .description('List all configured remotes')
    .action(async () => {
      const configService = new ConfigService();
      const remotes = await configService.getRemotes();
      const defaultRemote = await configService.getDefaultRemote();

      if (remotes.length === 0) {
        console.log('No remotes configured.');
        console.log("Use 'twenty remote add' to add one.");

        return;
      }

      console.log('');

      for (const remoteName of remotes) {
        const config = await configService.getConfigForRemote(remoteName);

        const authMethod = config.twentyCLIAccessToken
          ? 'oauth'
          : config.apiKey
            ? 'api-key'
            : 'none';

        const isDefault = remoteName === defaultRemote;
        const marker = isDefault ? '* ' : '  ';
        const nameText = isDefault ? chalk.bold(remoteName) : remoteName;

        console.log(
          `${marker}${nameText}  ${chalk.gray(config.apiUrl)}  [${authMethod}]`,
        );
      }

      console.log(
        '\n',
        chalk.gray("Use 'twenty remote switch <name>' to change default"),
      );
    });

  remote
    .command('switch [name]')
    .description('Set the default remote')
    .action(async (nameArg?: string) => {
      const configService = new ConfigService();

      const remoteName =
        nameArg ??
        (
          await inquirer.prompt<{ remote: string }>([
            {
              type: 'list',
              name: 'remote',
              message: 'Select default remote:',
              choices: await configService.getRemotes(),
            },
          ])
        ).remote;

      const remotes = await configService.getRemotes();

      if (!remotes.includes(remoteName)) {
        console.error(chalk.red(`Remote "${remoteName}" not found.`));
        process.exit(1);
      }

      await configService.setDefaultRemote(remoteName);
      console.log(chalk.green(`✓ Default remote set to "${remoteName}".`));
    });

  remote
    .command('status')
    .description('Show active remote and authentication status')
    .action(async () => {
      const configService = new ConfigService();
      const apiService = new ApiService();
      const activeRemote = ConfigService.getActiveRemote();
      const config = await configService.getConfig();

      const authMethod = config.twentyCLIAccessToken
        ? 'oauth'
        : config.apiKey
          ? 'api-key'
          : 'none';

      console.log(`  Remote:  ${chalk.bold(activeRemote)}`);
      console.log(`  Server:  ${config.apiUrl}`);

      if (authMethod === 'none') {
        console.log(`  Auth:    ${chalk.yellow('not configured')}`);

        return;
      }

      const { authValid } = await apiService.validateAuth();

      const statusText = authValid
        ? chalk.green(`${authMethod} (valid)`)
        : chalk.red(`${authMethod} (invalid)`);

      console.log(`  Auth:    ${statusText}`);
    });

  remote
    .command('remove <name>')
    .description('Remove a remote')
    .action(async (name: string) => {
      const configService = new ConfigService();
      const remotes = await configService.getRemotes();

      if (!remotes.includes(name)) {
        console.error(chalk.red(`Remote "${name}" not found.`));
        process.exit(1);
      }

      ConfigService.setActiveRemote(name);
      await configService.clearConfig();

      console.log(chalk.green(`✓ Remote "${name}" removed.`));
    });
};
