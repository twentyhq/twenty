import { authLogin } from '@/cli/operations/login';
import { authLoginOAuth } from '@/cli/operations/login-oauth';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { getConfigPath } from '@/cli/utilities/config/get-config-path';
import { detectLocalServer } from '@/cli/utilities/server/detect-local-server';
import chalk from 'chalk';
import type { Command } from 'commander';
import inquirer from 'inquirer';
import { normalizeUrl } from 'twenty-shared/utils';

const deriveRemoteName = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;

    return hostname.replace(/\./g, '-');
  } catch {
    return 'remote';
  }
};

type AuthMethod = 'OAuth' | 'API key';

const authenticate = async (
  apiUrl: string,
  apiKey?: string,
): Promise<AuthMethod> => {
  if (apiKey) {
    const result = await authLogin({ apiKey, apiUrl });

    if (!result.success) {
      console.error(chalk.red('✗ Authentication failed.'));
      process.exit(1);
    }

    return 'API key';
  }

  return runOAuthWithApiKeyFallback(apiUrl);
};

const runOAuthWithApiKeyFallback = async (
  apiUrl: string,
): Promise<AuthMethod> => {
  console.log(chalk.gray('Opening browser for authentication...'));

  const oauthResult = await authLoginOAuth({ apiUrl });

  if (oauthResult.success) {
    return 'OAuth';
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

  const fallbackResult = await authLogin({
    apiKey: keyAnswer.apiKey,
    apiUrl,
  });

  if (!fallbackResult.success) {
    console.error(chalk.red('✗ Authentication failed.'));
    process.exit(1);
  }

  return 'API key';
};

const addAction = async (options: {
  as?: string;
  apiKey?: string;
  url?: string;
  apiUrl?: string;
  local?: boolean;
  test?: boolean;
}) => {
  if (options.apiUrl) {
    console.warn(chalk.yellow('⚠ --api-url is deprecated. Use --url instead.'));
  }
  const configPath = options.test ? getConfigPath(true) : undefined;
  const configService = new ConfigService(
    configPath ? { configPath } : undefined,
  );
  const existingRemotes = await configService.getRemotes();

  if (options.as !== undefined && existingRemotes.includes(options.as)) {
    const config = await configService.getConfigForRemote(options.as);

    ConfigService.setActiveRemote(options.as);
    const method = await authenticate(config.apiUrl, options.apiKey);

    console.log(
      chalk.green(`✓ Re-authenticated "${options.as}" via ${method}.`),
    );

    await configService.setDefaultRemote(options.as);
    console.log(chalk.green(`✓ Default remote set to "${options.as}".`));

    return;
  }

  let serverUrl = options.url ?? options.apiUrl;

  if (serverUrl) {
    serverUrl = normalizeUrl(serverUrl);
  } else {
    const detectedUrl = await detectLocalServer();

    if (options.local) {
      if (!detectedUrl) {
        console.error(
          chalk.red(
            'No local Twenty server found.\n' +
              'Start one with: yarn twenty docker:start',
          ),
        );
        process.exit(1);
      }

      console.log(chalk.gray(`Found local server at ${detectedUrl}`));
      serverUrl = detectedUrl;
    } else {
      serverUrl = normalizeUrl(
        (
          await inquirer.prompt<{ serverUrl: string }>([
            {
              type: 'input',
              name: 'serverUrl',
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
        ).serverUrl,
      );
    }
  }

  const name = options.as ?? deriveRemoteName(serverUrl);

  ConfigService.setActiveRemote(name);
  const method = await authenticate(serverUrl, options.apiKey);

  console.log(
    chalk.green(`✓ Remote "${name}" added (${serverUrl}) via ${method}.`),
  );

  await configService.setDefaultRemote(name);
  console.log(chalk.green(`✓ Default remote set to "${name}".`));
};

const listAction = async () => {
  const configService = new ConfigService();
  const remotes = await configService.getRemotes();
  const defaultRemote = await configService.getDefaultRemote();

  if (remotes.length === 0) {
    console.log('No remotes configured.');
    console.log("Use 'twenty remote:add' to add one.");

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
    chalk.gray("Use 'twenty remote:use <name>' to change default"),
  );
};

const useAction = async (nameArg?: string) => {
  const configService = new ConfigService();

  const remoteName =
    nameArg ??
    (
      await inquirer.prompt<{ remote: string }>([
        {
          type: 'select',
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
};

const statusAction = async () => {
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
};

const removeAction = async (name: string) => {
  const configService = new ConfigService();
  const remotes = await configService.getRemotes();

  if (!remotes.includes(name)) {
    console.error(chalk.red(`Remote "${name}" not found.`));
    process.exit(1);
  }

  ConfigService.setActiveRemote(name);
  await configService.clearConfig();

  console.log(chalk.green(`✓ Remote "${name}" removed.`));
};

export const registerRemoteCommands = (program: Command): void => {
  program
    .command('remote:add')
    .description('Add or re-authenticate a remote')
    .option('--as <name>', 'Name for this remote')
    .option('--api-key <apiKey>', 'API key for non-interactive auth')
    .option('--url <url>', 'Server URL')
    .option('--api-url <apiUrl>', '[deprecated: use --url]')
    .option('--local', 'Connect to a local Twenty server (auto-detect)')
    .option('--test', 'Write to config.test.json (for integration tests)')
    .action(addAction);

  program
    .command('remote:list')
    .description('List all configured remotes')
    .action(listAction);

  program
    .command('remote:use [name]')
    .description('Set the default remote')
    .action(useAction);

  program
    .command('remote:status')
    .description('Show active remote auth status')
    .action(statusAction);

  program
    .command('remote:remove <name>')
    .description('Remove a remote')
    .action(removeAction);

  // Deprecated: `remote <subcommand>` forwarding to `remote:<subcommand>`
  const remote = program
    .command('remote', { hidden: true })
    .description('Manage remote Twenty servers');

  const deprecate = (oldCmd: string, newCmd: string) =>
    console.warn(
      chalk.yellow(
        `⚠ \`twenty remote ${oldCmd}\` is deprecated. Use \`twenty ${newCmd}\` instead.`,
      ),
    );

  remote
    .command('add')
    .option('--as <name>', 'Name for this remote')
    .option('--api-key <apiKey>', 'API key for non-interactive auth')
    .option('--url <url>', 'Server URL')
    .option('--api-url <apiUrl>', '[deprecated: use --url]')
    .option('--local', 'Connect to a local Twenty server (auto-detect)')
    .option('--test', 'Write to config.test.json (for integration tests)')
    .action(
      async (options: {
        as?: string;
        apiKey?: string;
        url?: string;
        apiUrl?: string;
        local?: boolean;
        test?: boolean;
      }) => {
        deprecate('add', 'remote:add');
        await addAction(options);
      },
    );

  remote.command('list').action(async () => {
    deprecate('list', 'remote:list');
    await listAction();
  });

  remote.command('switch [name]').action(async (name?: string) => {
    deprecate('switch', 'remote:use');
    await useAction(name);
  });

  remote.command('status').action(async () => {
    deprecate('status', 'remote:status');
    await statusAction();
  });

  remote.command('remove <name>').action(async (name: string) => {
    deprecate('remove', 'remote:remove');
    await removeAction(name);
  });
};
