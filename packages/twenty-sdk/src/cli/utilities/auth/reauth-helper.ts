import inquirer from 'inquirer';
import chalk from 'chalk';
import { authLoginOAuth } from '@/cli/operations/login-oauth';
import { ConfigService } from '@/cli/utilities/config/config-service';

export type ReauthOutcome = 'reauthenticated' | 'declined' | 'non-interactive';

export const promptForReauthentication = async (
  remoteName: string,
): Promise<ReauthOutcome> => {
  if (!process.stdout.isTTY) {
    return 'non-interactive';
  }

  const { proceed } = await inquirer.prompt<{ proceed: boolean }>([
    {
      type: 'confirm',
      name: 'proceed',
      message: `Re-authenticate remote "${remoteName}" now?`,
      default: true,
    },
  ]);

  if (!proceed) {
    return 'declined';
  }

  const configService = new ConfigService();
  const { apiUrl } = await configService.getConfig();

  const result = await authLoginOAuth({ apiUrl, remote: remoteName });

  if (result.success) {
    console.log(chalk.green(`✓ Re-authenticated "${remoteName}".`));

    return 'reauthenticated';
  }

  console.log(chalk.yellow(result.error.message));
  console.log(chalk.yellow('Run `yarn twenty remote:add` to re-authenticate.'));

  return 'declined';
};
