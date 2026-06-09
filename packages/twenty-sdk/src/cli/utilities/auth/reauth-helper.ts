import inquirer from 'inquirer';
import chalk from 'chalk';
import { ApiService } from '@/cli/utilities/api/api-service';
import { ConfigService } from '@/cli/utilities/config/config-service';
import { isTokenExpiredMessage } from './token-expired-detector';

export { isTokenExpiredMessage } from './token-expired-detector';

export type ReauthOutcome = 'reauthenticated' | 'declined' | 'non-interactive';

const isInteractive = (): boolean => process.stdin.isTTY === true;

export const promptForReauthentication = async (
  remoteName: string,
): Promise<ReauthOutcome> => {
  if (!isInteractive()) {
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
  const config = await configService.getConfigForRemote(remoteName);
  const apiService = new ApiService();
  const { authValid } = await apiService.validateAuth();

  if (authValid) {
    console.log(chalk.green(`✓ Remote "${remoteName}" is still valid.`));

    return 'reauthenticated';
  }

  console.log(
    chalk.yellow(
      `Re-run: twenty remote:add --as ${remoteName} --api-key <NEW_KEY>`,
    ),
  );
  console.log(
    chalk.gray(`Generate a new key at: ${config.apiUrl}/settings/developers`),
  );

  return 'declined';
};
